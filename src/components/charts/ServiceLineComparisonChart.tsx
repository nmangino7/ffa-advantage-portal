'use client';

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
import type { ServiceLineComparisonData } from '@/lib/analytics';

export function ServiceLineComparisonChart({ data }: { data: ServiceLineComparisonData[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="short" tick={{ fontSize: 11, fill: '#737373' }} />
        <YAxis tick={{ fontSize: 11, fill: '#737373' }} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="enrolled" fill="#a5b4fc" name="Enrolled" radius={[2, 2, 0, 0]} />
        <Bar dataKey="opened" fill="#6366f1" name="Opened" radius={[2, 2, 0, 0]} />
        <Bar dataKey="clicked" fill="#f59e0b" name="Clicked" radius={[2, 2, 0, 0]} />
        <Bar dataKey="replied" fill="#10b981" name="Replied" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
