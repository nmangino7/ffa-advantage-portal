'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function SparklineChart({ data }: { data: number[] }) {
  // Handle empty or all-zero data gracefully
  if (!data || data.length === 0) {
    return (
      <div className="w-[80px] h-[24px] flex items-center justify-center">
        <div className="w-full h-[1px] bg-neutral-200" />
      </div>
    );
  }

  const allZero = data.every(v => v === 0);
  if (allZero) {
    return (
      <div className="w-[80px] h-[24px] flex items-center justify-center">
        <div className="w-full h-[1px] bg-neutral-200" />
      </div>
    );
  }

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
