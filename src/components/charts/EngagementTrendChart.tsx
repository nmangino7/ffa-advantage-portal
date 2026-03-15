'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { EngagementTrendData } from '@/lib/analytics';

export function EngagementTrendChart({ data }: { data: EngagementTrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#737373' }}
          interval="preserveStartEnd"
        />
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
        <Area
          type="monotone"
          dataKey="engagements"
          stroke="#6366f1"
          fill="url(#engagementFill)"
          strokeWidth={2}
          name="Total"
        />
        <Area
          type="monotone"
          dataKey="opens"
          stroke="#60a5fa"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          name="Opens"
        />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#fbbf24"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          name="Clicks"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
