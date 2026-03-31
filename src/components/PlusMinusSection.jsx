import { useState } from 'react';
import {
  buildPlusMinusBalancingSet,
  theoreticalBound,
  verifyPlusMinusBalancingSet,
  exhaustiveVerify,
} from '../algorithms/plusMinus';
import VectorHeatmap from './VectorHeatmap';
import CoverageProgress from './CoverageProgress';

/** Parse an integer from a raw string, clamped to [min, max]; returns fallback if invalid. */
function clampInt(raw, min, max, fallback) {
  const v = parseInt(raw, 10);
  return isNaN(v) ? fallback : Math.max(min, Math.min(max, v));
}

export default function PlusMinusSection() {
  // Raw string states let users clear/retype freely without snapping to min.
  const [nRaw, setNRaw] = useState('6');
  const [dRaw, setDRaw] = useState('2');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  // Derived numeric values used by the algorithm.
  const n = clampInt(nRaw, 1, 30, 6);
  const d = clampInt(dRaw, 0, n - 1, 0);

  function handleNChange(e) {
    const raw = e.target.value;
    setNRaw(raw);
    // Re-clamp d immediately when n decreases below d+1.
    const newN = clampInt(raw, 1, 30, n);
    const currentD = clampInt(dRaw, 0, 30, 0);
    if (currentD > newN - 1) {
      setDRaw(String(Math.max(0, newN - 1)));
    }
  }

  function handleNBlur() {
    // Normalise display and ensure d stays in range.
    const newN = clampInt(nRaw, 1, 30, 6);
    setNRaw(String(newN));
    const currentD = clampInt(dRaw, 0, 30, 0);
    if (currentD > newN - 1) {
      setDRaw(String(Math.max(0, newN - 1)));
    }
  }

  function handleDChange(e) {
    setDRaw(e.target.value);
  }

  function handleDBlur() {
    setDRaw(String(clampInt(dRaw, 0, n - 1, 0)));
  }

  function run() {
    setBusy(true);
    setTimeout(() => {
      const result = buildPlusMinusBalancingSet(n, d);
      const k = theoreticalBound(n, d);
      const verify = verifyPlusMinusBalancingSet(result.family, n, d, 2000);
      const exhaustive = exhaustiveVerify(result.family, n, d);
      setResult({ family: result.family, steps: result.steps, k, verify, exhaustive, n, d, approximate: result.approximate });
      setBusy(false);
    }, 0);
  }

  const coverPct = result
    ? (result.verify.coverageRate * 100).toFixed(1)
    : null;

  return (
    <section className="section pm-section">
      <h2 className="section-title">
        ±1 Balancing Sets — Knuth's Construction
      </h2>
      <p className="section-desc">
        Given <em>n</em> and <em>d</em>, builds a minimal family of ±1 vectors
        of dimension <em>n</em> such that for every ±1 vector <em>w</em> there
        exists <em>v</em> in the family with |v·w| ≤ <em>d</em>.
        The optimal bound is <strong>K(n,&nbsp;d)&nbsp;=&nbsp;⌈n/(d+1)⌉</strong>.
      </p>

      <div className="input-row">
        <label className="input-label">
          n (dimension)
          <input
            type="number"
            className="input-field"
            min={1}
            max={30}
            value={nRaw}
            onChange={handleNChange}
            onBlur={handleNBlur}
          />
        </label>
        <label className="input-label">
          d (threshold)
          <input
            type="number"
            className="input-field"
            min={0}
            max={n - 1}
            value={dRaw}
            onChange={handleDChange}
            onBlur={handleDBlur}
          />
        </label>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? 'Computing…' : 'Compute'}
        </button>
      </div>

      {result && (
        <div className="results">
          {/* Summary cards */}
          <div className="card-row">
            <div className="stat-card">
              <span className="stat-value">{result.k}</span>
              <span className="stat-label">Theoretical bound K({result.n},{result.d})</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{result.family.length}</span>
              <span className="stat-label">Family size |F|</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{coverPct}%</span>
              <span className="stat-label">Coverage (2000 random tests)</span>
            </div>
            {result.exhaustive && (
              <div
                className={`stat-card ${result.exhaustive.uncoveredCount === 0 ? 'success' : 'error'}`}
              >
                <span className="stat-value">
                  {result.exhaustive.uncoveredCount === 0 ? '✓ All' : result.exhaustive.uncoveredCount + ' uncovered'}
                </span>
                <span className="stat-label">
                  Exhaustive check (all 2<sup>{result.n}</sup> vectors)
                </span>
              </div>
            )}
            <div className="stat-card">
              <span className="stat-value">
                {result.exhaustive ? result.exhaustive.maxBestDot : '—'}
              </span>
              <span className="stat-label">Max |v·w| achieved</span>
            </div>
          </div>

          {/* Bound formula */}
          <div className="formula-box">
            <span>
              K({result.n},&nbsp;{result.d}) = ⌈{result.n} / ({result.d}+1)⌉ ={' '}
              ⌈{result.n} / {result.d + 1}⌉ = <strong>{result.k}</strong>
            </span>
          </div>

          {/* Construction description */}
          <div className="algo-box">
            <strong>Construction:</strong>{' '}
            {result.approximate 
              ? `Partition ${result.n} coordinates into ${result.k} blocks of size ≈ ${result.d + 1}. For each block G_i, vector v_i is +1 on G_i and −1 elsewhere.`
              : `Greedy set-cover algorithm selected ${result.family.length} vectors to cover all 2^${result.n} test vectors.`
            }
          </div>

          {result.approximate && (
            <div className="note-box">
              ⚠ n &gt; 14 — using partition construction (approximate).
            </div>
          )}

          {/* Step-by-step greedy progress */}
          {result.steps && result.steps[0]?.newlyCovered !== null && (
            <CoverageProgress steps={result.steps} totalVectors={1 << Math.min(result.n, 14)} />
          )}

          {/* Heatmap */}
          <VectorHeatmap
            family={result.family}
            mode="pm"
            label={`Family of ${result.family.length} ±1 vectors (green = +1, red = −1)`}
          />
        </div>
      )}
    </section>
  );
}
