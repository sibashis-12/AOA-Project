import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PropTypes from 'prop-types';

/**
 * BoundChart – bar chart comparing empirical family sizes to theoretical bounds.
 */
export default function BoundChart({ data, title }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bound-chart">
      {title && <p className="chart-title">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="n" label={{ value: 'n', position: 'insideBottomRight', offset: -5 }} />
          <YAxis allowDecimals={false} label={{ value: 'Size', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="empirical" name="Empirical |F|" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="theoretical" name="Bound ⌈n/(2d)⌉" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

BoundChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      n: PropTypes.number,
      empirical: PropTypes.number,
      theoretical: PropTypes.number,
    })
  ).isRequired,
  title: PropTypes.string,
};
