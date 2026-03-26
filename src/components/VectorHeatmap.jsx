import PropTypes from 'prop-types';

/**
 * VectorHeatmap – displays a family of ±1 or {0,1} vectors as a coloured grid.
 * Each row = one vector; each cell = one coordinate.
 *   ±1 mode: +1 → green, −1 → red
 *   0-1 mode: 1 → blue, 0 → white
 */
export default function VectorHeatmap({ family, mode = 'pm', label = '' }) {
  if (!family || family.length === 0) {
    return <p className="empty-hint">No vectors to display.</p>;
  }

  const n = family[0].length;
  const cellSize = Math.max(16, Math.min(32, Math.floor(480 / n)));

  function cellStyle(val) {
    if (mode === 'pm') {
      return val === 1
        ? { background: '#22c55e', color: '#fff' } // green
        : { background: '#ef4444', color: '#fff' }; // red
    }
    return val === 1
      ? { background: '#3b82f6', color: '#fff' } // blue
      : { background: '#e5e7eb', color: '#374151' }; // light grey
  }

  return (
    <div className="heatmap-wrapper">
      {label && <p className="heatmap-label">{label}</p>}
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-th-idx">#</th>
              {Array.from({ length: n }, (_, i) => (
                <th key={i} className="heatmap-th" style={{ width: cellSize }}>
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {family.map((v, ri) => (
              <tr key={ri}>
                <td className="heatmap-row-idx">v{ri + 1}</td>
                {v.map((val, ci) => (
                  <td
                    key={ci}
                    className="heatmap-cell"
                    style={{ ...cellStyle(val), width: cellSize, height: cellSize }}
                    title={`v${ri + 1}[${ci + 1}] = ${val}`}
                  >
                    {cellSize >= 22 ? val : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="heatmap-legend">
        {mode === 'pm' ? (
          <>
            <span className="legend-box" style={{ background: '#22c55e' }} /> +1&nbsp;&nbsp;
            <span className="legend-box" style={{ background: '#ef4444' }} /> −1
          </>
        ) : (
          <>
            <span className="legend-box" style={{ background: '#3b82f6' }} /> 1&nbsp;&nbsp;
            <span className="legend-box" style={{ background: '#e5e7eb', border: '1px solid #d1d5db' }} /> 0
          </>
        )}
      </div>
    </div>
  );
}

VectorHeatmap.propTypes = {
  family: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  mode: PropTypes.oneOf(['pm', 'binary']),
  label: PropTypes.string,
};
