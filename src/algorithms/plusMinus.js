/**
 * Balancing Sets of ±1 Vectors — Knuth's Construction
 *
 * Given integers n and d, find a minimal family F of ±1 vectors of dimension n
 * such that for every ±1 vector w, ∃ v ∈ F with |v·w| ≤ d.
 *
 * Optimal bound: K(n, d) = ⌈n / (d + 1)⌉
 *
 * Construction: Greedy set-cover over {±1}^n test vectors.
 *
 * Key identity: for ±1 vectors encoded as bitmasks (bit i = 1 ↔ +1):
 *   v · w = n − 2 · popcount(v_mask XOR w_mask)
 *
 * This enables O(1) inner-product computation per (v, w) pair.
 *
 * Exact greedy for n ≤ 14 (≈ 16M–268M ops/step); partition construction
 * fallback for n > 14.
 */

/** Fast 32-bit popcount (Hamming weight) */
function popcount32(x) {
  x = x >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return Math.imul(x, 0x01010101) >>> 24;
}

/** Convert bitmask to ±1 array (bit i set → +1, otherwise → −1) */
function maskToPM(mask, n) {
  return Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? 1 : -1));
}

/** Theoretical bound K(n, d) = ⌈n / (d + 1)⌉ */
export function theoreticalBound(n, d) {
  return Math.ceil(n / (d + 1));
}

/**
 * Build a ±1 balancing family using greedy set-cover (n ≤ 14) or the
 * partition construction (n > 14).
 *
 * @param {number} n  dimension
 * @param {number} d  inner-product threshold
 * @returns {{ family, steps, bound, uncoveredCount, approximate }}
 */
export function buildPlusMinusBalancingSet(n, d) {
  const bound = theoreticalBound(n, d);

  if (n > 14) {
    return buildPartitionConstruction(n, d, bound);
  }

  // ----- Exact greedy for n ≤ 14 -----
  const numW = 1 << n;
  const covered = new Uint8Array(numW);
  let uncoveredCount = numW;
  const family = [];
  const steps = [];

  while (uncoveredCount > 0) {
    let bestMask = 0;
    let bestCoverage = -1;

    for (let cMask = 0; cMask < numW; cMask++) {
      let coverage = 0;
      for (let wMask = 0; wMask < numW; wMask++) {
        if (covered[wMask]) continue;
        const dp = n - 2 * popcount32(cMask ^ wMask);
        if (Math.abs(dp) <= d) coverage++;
      }
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestMask = cMask;
      }
    }

    const bestVec = maskToPM(bestMask, n);
    family.push(bestVec);

    let newlyCovered = 0;
    for (let wMask = 0; wMask < numW; wMask++) {
      if (covered[wMask]) continue;
      const dp = n - 2 * popcount32(bestMask ^ wMask);
      if (Math.abs(dp) <= d) {
        covered[wMask] = 1;
        uncoveredCount--;
        newlyCovered++;
      }
    }

    steps.push({ step: family.length, vectorAdded: bestVec, newlyCovered, remaining: uncoveredCount });
  }

  return { family, steps, bound, uncoveredCount: 0, approximate: false };
}

/**
 * Partition construction fallback (n > 14).
 * Partitions {0,…,n−1} into k = ⌈n/(d+1)⌉ groups; for each group G_i,
 * v_i[j] = +1 if j ∈ G_i, else −1.
 * Note: this may not cover every test vector exactly when d is small relative
 * to n; the UI shows an empirical coverage check.
 */
function buildPartitionConstruction(n, d, bound) {
  const k = bound;
  const family = [];
  const steps = [];
  const baseSize = Math.floor(n / k);
  const extraBlocks = n % k;

  let start = 0;
  for (let i = 0; i < k; i++) {
    const blockSize = baseSize + (i < extraBlocks ? 1 : 0);
    const v = new Array(n).fill(-1);
    for (let j = start; j < start + blockSize; j++) v[j] = 1;
    start += blockSize;
    family.push(v);
    steps.push({ step: i + 1, vectorAdded: v, newlyCovered: null, remaining: null });
  }

  return { family, steps, bound: k, uncoveredCount: null, approximate: true };
}

/**
 * Verify a ±1 family against random ±1 test vectors.
 * Uses fast bitmask inner-product for n ≤ 30.
 */
export function verifyPlusMinusBalancingSet(family, n, d, numTests = 2000) {
  // Encode family as bitmasks
  const fMasks = family.map((v) =>
    v.reduce((acc, vi, i) => acc | ((vi === 1 ? 1 : 0) << i), 0)
  );

  let coveredCount = 0;
  let maxBestDot = 0;
  const worstCases = [];

  for (let t = 0; t < numTests; t++) {
    // Random ±1 vector as bitmask
    let wMask = 0;
    for (let i = 0; i < n; i++) wMask |= (Math.random() < 0.5 ? 1 : 0) << i;

    // Best |v·w| across family
    let bestDot = Infinity;
    for (const vMask of fMasks) {
      const dp = Math.abs(n - 2 * popcount32(vMask ^ wMask));
      if (dp < bestDot) bestDot = dp;
    }

    if (bestDot <= d) coveredCount++;
    else if (worstCases.length < 5) worstCases.push({ w: maskToPM(wMask, n), bestDot });
    if (bestDot > maxBestDot) maxBestDot = bestDot;
  }

  return {
    covered: coveredCount,
    uncovered: numTests - coveredCount,
    total: numTests,
    coverageRate: coveredCount / numTests,
    maxBestDot,
    worstCases,
  };
}

/**
 * Exhaustive verification for n ≤ 14: check all 2^n ±1 test vectors.
 */
export function exhaustiveVerify(family, n, d) {
  if (n > 14) return null;

  const fMasks = family.map((v) =>
    v.reduce((acc, vi, i) => acc | ((vi === 1 ? 1 : 0) << i), 0)
  );

  const numW = 1 << n;
  let uncoveredCount = 0;
  let maxBestDot = 0;

  for (let wMask = 0; wMask < numW; wMask++) {
    let bestDot = Infinity;
    for (const vMask of fMasks) {
      const dp = Math.abs(n - 2 * popcount32(vMask ^ wMask));
      if (dp < bestDot) bestDot = dp;
    }
    if (bestDot > d) uncoveredCount++;
    if (bestDot > maxBestDot) maxBestDot = bestDot;
  }

  return { uncoveredCount, maxBestDot, total: numW };
}
