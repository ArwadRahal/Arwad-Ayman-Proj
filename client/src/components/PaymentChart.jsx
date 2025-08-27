import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'ינואר', subscribed: 50, percentage: 83 },
  { month: 'פברואר', subscribed: 60, percentage: 90 },
  { month: 'מרץ', subscribed: 55, percentage: 80 },
  { month: 'אפריל', subscribed: 70, percentage: 95 },
  { month: 'מאי', subscribed: 65, percentage: 88 },
  { month: 'יוני', subscribed: 75, percentage: 92 },
];

export default function MonthlyPaymentsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="month" />
        <YAxis
          yAxisId="left"
          label={{ value: 'מספר מתאמנות', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'אחוז תשלום', angle: -90, position: 'insideRight' }}
        />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="subscribed" barSize={30} fill="#693b88" />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="percentage"
          stroke="#d9534f"
          strokeWidth={3}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
