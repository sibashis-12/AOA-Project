import { useState } from 'react';
import {
  buildBinaryBalancingSet,
  verifyBinaryBalancingSet,
  computeEmpiricalTable,
} from '../algorithms/binaryVectors';
import VectorHeatmap from './VectorHeatmap';
import BoundChart from './BoundChart';
import CoverageProgress from './CoverageProgress';

export default function BinarySection() {
  const [n, setN] = useState(6);
  const [d, setD] = useState(2);
  const [result, setResult] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tableD, setTableD] = useState(2);

  function run() {
    setBusy(true);
    setTimeout(() => {
      const { family, steps, bound, uncoveredCount, approximate } =
        buildBinaryBalancingSet(n, d);
      const verify = verifyBinaryBalancingSet(family, n, d);
      setResult({ family, steps, bound, uncoveredCount, approximate, verify, n, d });
      setBusy(false);
    }, 0);
  }

  function runTable() {
    setBusy(true);
    setTimeout(() => {
      const maxN = Math.min(n, 10); // limit table to n ≤ 10 for speed
      const data = computeEmpiricalTable(maxN, tableD);
      setTableData({ data, d: tableD });
      setBusy(false);
    }, 0);
  }

  const coverPct = result
    ? (result.verify.coverageRate * 100).toFixed(1)
    : null;

  return (
    <section className="section bin-section">
      <h2 className="section-title">
        0-1 Balancing Sets — Greedy Heuristic
      </h2>
      <p className="section-desc">
        Adapts the balancing sets problem to binary {'{0,1}'}
        <sup>n</sup> test vectors. The family F is still made up of ±1 vectors.
        A greedy set-cover algorithm builds a small F such that every w ∈{' '}
        {'{0,1}'}
        <sup>n</sup> satisfies |v·w| ≤ d for some v ∈ F.
        Theoretical bound:{' '}
        <strong>K&#x2080;&#x2081;(n,&nbsp;d)&nbsp;=&nbsp;⌈n/(2d)⌉</strong>.
      </p>

      <div className="input-row">
        <label className="input-label">
          n (dimension)
          <input
            type="number"
            className="input-field"
            min={1}
            max={16}
            value={n}
            onChange={(e) => setN(Math.max(1, Math.min(16, Number(e.target.value))))}
          />
        </label>
        <label className="input-label">
          d (threshold)
          <input
            type="number"
            className="input-field"
            min={1}
            max={n}
            value={d}
            onChange={(e) => setD(Math.max(1, Math.min(n, Number(e.target.value))))}
          />
        </label>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? 'Computing…' : 'Run Greedy'}
        </button>
      </div>

      {result && (
        <div className="results">
          {/* Summary cards */}
          <div className="card-row">
            <div className="stat-card">
              <span className="stat-value">{result.bound}</span>
              <span className="stat-label">Theoretical bound ⌈{result.n}/(2·{result.d})⌉</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{result.family.length}</span>
              <span className="stat-label">Greedy family size |F|</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{coverPct}%</span>
              <span className="stat-label">
                {result.verify.exhaustive
                  ? `Exhaustive (all ${result.verify.total} vectors)`
                  : `Sample coverage (${result.verify.total} tests)`}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{result.verify.maxBestDot}</span>
              <span className="stat-label">Max best |v·w| seen</span>
            </div>
          </div>

          {/* Formula */}
          <div className="formula-box">
            K&#x2080;&#x2081;({result.n},&nbsp;{result.d}) = ⌈{result.n} / (2·{result.d})⌉ ={' '}
            ⌈{result.n} / {2 * result.d}⌉ = <strong>{result.bound}</strong>
          </div>

          {result.approximate && (
            <div className="note-box">
              ⚠ n &gt; 12 — result uses randomised candidate sampling (approximate).
            </div>
          )}

          {/* Step-by-step greedy progress */}
          <CoverageProgress steps={result.steps} totalVectors={1 << Math.min(result.n, 20)} />

          {/* Heatmap */}
          <VectorHeatmap
            family={result.family}
            mode="pm"
            label={`Greedy balancing family (${result.family.length} vectors; green = +1, red = −1)`}
          />
        </div>
      )}

      {/* Comparison table section */}
      <div className="table-section">
        <h3 className="subsection-title">Empirical vs Theoretical Bound Table</h3>
        <p className="section-desc">
          Compare empirical (greedy) family sizes with the theoretical bound ⌈n/(2d)⌉
          across multiple values of n (1 to min(current n, 10)).
        </p>
        <div className="input-row">
          <label className="input-label">
            d for table
            <input
              type="number"
              className="input-field"
              min={1}
              max={8}
              value={tableD}
              onChange={(e) => setTableD(Math.max(1, Math.min(8, Number(e.target.value))))}
            />
          </label>
          <button className="btn btn-secondary" onClick={runTable} disabled={busy}>
            {busy ? 'Computing…' : 'Build Table'}
          </button>
        </div>

        {tableData && (
          <>
            <BoundChart
              data={tableData.data}
              title={`Empirical vs Theoretical family size (d=${tableData.d})`}
            />
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>n</th>
                    <th>Greedy |F|</th>
                    <th>⌈n/(2d)⌉</th>
                    <th>Ratio</th>
                    <th>Approx?</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.data.map(({ n: ni, empirical, theoretical, approximate }) => (
                    <tr key={ni}>
                      <td>{ni}</td>
                      <td>{empirical}</td>
                      <td>{theoretical}</td>
                      <td
                        style={{
                          color:
                            empirical <= theoretical
                              ? '#16a34a'
                              : empirical <= theoretical * 2
                              ? '#d97706'
                              : '#dc2626',
                          fontWeight: 600,
                        }}
                      >
                        {theoretical > 0 ? (empirical / theoretical).toFixed(2) : '—'}
                      </td>
                      <td>{approximate ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
