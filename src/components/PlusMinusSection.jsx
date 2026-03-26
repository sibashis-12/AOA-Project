import { useState } from 'react';
import {
  buildPlusMinusBalancingSet,
  theoreticalBound,
  verifyPlusMinusBalancingSet,
  exhaustiveVerify,
} from '../algorithms/plusMinus';
import VectorHeatmap from './VectorHeatmap';

export default function PlusMinusSection() {
  const [n, setN] = useState(6);
  const [d, setD] = useState(2);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  function run() {
    setBusy(true);
    setTimeout(() => {
      const family = buildPlusMinusBalancingSet(n, d);
      const k = theoreticalBound(n, d);
      const verify = verifyPlusMinusBalancingSet(family, n, d, 2000);
      const exhaustive = exhaustiveVerify(family, n, d);
      setResult({ family, k, verify, exhaustive, n, d });
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
            value={n}
            onChange={(e) => setN(Math.max(1, Math.min(30, Number(e.target.value))))}
          />
        </label>
        <label className="input-label">
          d (threshold)
          <input
            type="number"
            className="input-field"
            min={0}
            max={n - 1}
            value={d}
            onChange={(e) => setD(Math.max(0, Math.min(n - 1, Number(e.target.value))))}
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
            <strong>Construction:</strong> Partition {result.n} coordinates into{' '}
            {result.k} blocks of size ≈ {result.d + 1}. For each block G<sub>i</sub>,
            vector v<sub>i</sub> is +1 on G<sub>i</sub> and −1 elsewhere.
          </div>

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
