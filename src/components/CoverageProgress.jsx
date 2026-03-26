import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * CoverageProgress – area chart showing how quickly the greedy algorithm
 * covers the test space, step by step.
 */
export default function CoverageProgress({ steps, totalVectors }) {
  if (!steps || steps.length === 0) return null;

  const data = steps.map((s) => ({
    step: `v${s.step}`,
    covered: totalVectors - s.remaining,
    pct: (((totalVectors - s.remaining) / totalVectors) * 100).toFixed(1),
  }));

  return (
    <div className="coverage-progress">
      <p className="chart-title">Greedy Coverage Progress</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" />
          <YAxis
            tickFormatter={(v) => `${((v / totalVectors) * 100).toFixed(0)}%`}
            domain={[0, totalVectors]}
          />
          <Tooltip
            formatter={(v) => [`${v} (${((v / totalVectors) * 100).toFixed(1)}%)`, 'Covered']}
          />
          <Area
            type="monotone"
            dataKey="covered"
            stroke="#6366f1"
            fill="url(#covGrad)"
            name="Covered"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

CoverageProgress.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      step: PropTypes.number,
      newlyCovered: PropTypes.number,
      remaining: PropTypes.number,
    })
  ).isRequired,
  totalVectors: PropTypes.number.isRequired,
};
