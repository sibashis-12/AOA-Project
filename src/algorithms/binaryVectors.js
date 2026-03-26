/**
 * Balancing Sets of 0-1 Vectors — Greedy Heuristic
 *
 * Adapt the balancing sets problem to binary {0,1}^n test vectors.
 * The balancing family F ⊂ {±1}^n; the covering condition is:
 *   ∀ w ∈ {0,1}^n, ∃ v ∈ F : |v·w| ≤ d
 *
 * Inner product for v ∈ {±1}^n, w ∈ {0,1}^n:
 *   v·w = Σ_{j: w_j=1} v_j = (# positions where v=+1 in support of w)
 *         − (# positions where v=−1 in support of w)
 *
 * Encoding: v as bitmask M_v (bit i = 1 ↔ v_i = +1); w as bitmask M_w.
 *   v·w = popcount(M_v & M_w) − popcount(~M_v & M_w)
 *       = 2·popcount(M_v & M_w) − popcount(M_w)     [since the two halves sum to popcount(M_w)]
 *
 * Theoretical bound: K_{0,1}(n, d) = ⌈n / (2d)⌉
 *
 * Algorithm: Greedy set-cover.
 * Exact for n ≤ 12 (full enumeration), approximate for n > 12 (random sampling).
 */

/** Fast 32-bit popcount */
function popcount32(x) {
  x = x >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return Math.imul(x, 0x01010101) >>> 24;
}

/** Convert ±1 bitmask to ±1 array */
function maskToPM(mask, n) {
  return Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? 1 : -1));
}

/** Dot product: v (±1 mask) · w (binary mask) */
function dotPMBin(vMask, wMask) {
  return 2 * popcount32(vMask & wMask) - popcount32(wMask);
}

/** Theoretical bound for the 0-1 variant */
export function theoreticalBound01(n, d) {
  return Math.ceil(n / (2 * d));
}

/** Dot product of plain ±1 array v and {0,1} array w */
export function dotPM01(v, w) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * w[i];
  return s;
}

/**
 * Build a 0-1 balancing family using greedy set-cover.
 *
 * @param {number} n           dimension
 * @param {number} d           inner-product threshold
 * @param {number} [maxSteps]  stop after this many vectors (default: bound × 4)
 * @returns {{ family, steps, bound, uncoveredCount, approximate }}
 */
export function buildBinaryBalancingSet(n, d, maxSteps) {
  const bound = theoreticalBound01(n, d);
  const cap = maxSteps ?? Math.max(bound * 4, bound + 3);
  const exact = n <= 12;
  const numW = exact ? 1 << n : Math.min(1 << n, 2048);

  // Build test vector bitmasks
  let testMasks;
  if (exact) {
    testMasks = Uint32Array.from({ length: numW }, (_, i) => i);
  } else {
    const seen = new Set();
    testMasks = new Uint32Array(numW);
    let t = 0;
    while (t < numW) {
      let m = 0;
      for (let i = 0; i < n; i++) m |= (Math.random() < 0.5 ? 1 : 0) << i;
      if (seen.has(m)) continue;
      seen.add(m);
      testMasks[t++] = m;
    }
  }

  const covered = new Uint8Array(numW);
  let uncoveredCount = numW;
  const family = [];
  const steps = [];

  // Build candidate ±1 vectors
  const numCandidates = exact ? 1 << n : Math.min(1 << n, 512);

  while (uncoveredCount > 0 && family.length < cap) {
    let candidateMasks;
    if (exact) {
      candidateMasks = { length: numCandidates, get: (i) => i };
    } else {
      const arr = new Uint32Array(numCandidates);
      for (let i = 0; i < numCandidates; i++) {
        let m = 0;
        for (let b = 0; b < n; b++) m |= (Math.random() < 0.5 ? 1 : 0) << b;
        arr[i] = m;
      }
      candidateMasks = { length: numCandidates, get: (i) => arr[i] };
    }

    let bestCMask = 0;
    let bestCoverage = -1;

    for (let ci = 0; ci < candidateMasks.length; ci++) {
      const cMask = candidateMasks.get(ci);
      let coverage = 0;
      for (let wi = 0; wi < numW; wi++) {
        if (covered[wi]) continue;
        const dp = dotPMBin(cMask, testMasks[wi]);
        if (Math.abs(dp) <= d) coverage++;
      }
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestCMask = cMask;
      }
    }

    const bestVec = maskToPM(bestCMask, n);
    family.push(bestVec);

    let newlyCovered = 0;
    for (let wi = 0; wi < numW; wi++) {
      if (covered[wi]) continue;
      if (Math.abs(dotPMBin(bestCMask, testMasks[wi])) <= d) {
        covered[wi] = 1;
        uncoveredCount--;
        newlyCovered++;
      }
    }

    steps.push({ step: family.length, vectorAdded: bestVec, newlyCovered, remaining: uncoveredCount });
  }

  return { family, steps, bound, uncoveredCount, approximate: !exact };
}

/**
 * Verify a ±1 family against {0,1}^n test vectors (exhaustive for n ≤ 20).
 */
export function verifyBinaryBalancingSet(family, n, d, numSamples = 2000) {
  const fMasks = family.map((v) =>
    v.reduce((acc, vi, i) => acc | ((vi === 1 ? 1 : 0) << i), 0)
  );

  const exhaustive = n <= 20;
  const total = exhaustive ? Math.min(1 << n, 1 << 20) : numSamples;
  let coveredCount = 0;
  let maxBestDot = 0;

  for (let t = 0; t < total; t++) {
    let wMask;
    if (exhaustive) {
      wMask = t;
    } else {
      wMask = 0;
      for (let i = 0; i < n; i++) wMask |= (Math.random() < 0.5 ? 1 : 0) << i;
    }

    let best = Infinity;
    for (const vMask of fMasks) {
      const dp = Math.abs(dotPMBin(vMask, wMask));
      if (dp < best) best = dp;
    }

    if (best <= d) coveredCount++;
    if (best > maxBestDot) maxBestDot = best;
  }

  return {
    covered: coveredCount,
    uncovered: total - coveredCount,
    total,
    coverageRate: coveredCount / total,
    maxBestDot,
    exhaustive,
  };
}

/**
 * Build comparison table: for n = 1…maxN, run greedy and record sizes.
 */
export function computeEmpiricalTable(maxN, d) {
  const rows = [];
  for (let n = 1; n <= maxN; n++) {
    const { family, approximate } = buildBinaryBalancingSet(n, d);
    rows.push({
      n,
      empirical: family.length,
      theoretical: theoreticalBound01(n, d),
      approximate,
    });
  }
  return rows;
}
