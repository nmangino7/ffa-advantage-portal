'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function SparklineChart({ data }: { data: number[] }) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width={80} height={24}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="#818cf8"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
