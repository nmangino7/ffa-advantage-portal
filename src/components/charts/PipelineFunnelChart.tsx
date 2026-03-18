'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PipelineFunnelData } from '@/lib/analytics';

export function PipelineFunnelChart({ data }: { data: PipelineFunnelData[] }) {
  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-neutral-400">
        No pipeline data to display yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 20, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#737373' }} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: '#525252' }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Contacts">
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
