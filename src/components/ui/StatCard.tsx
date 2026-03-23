import type { ReactNode } from 'react';

export function StatCard({
  value,
  label,
  sub,
  icon,
  accentColor,
  trend,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
  icon?: ReactNode;
  accentColor?: string;
  trend?: string;
}) {
  const isPositive = trend && !trend.startsWith('-');
  const trendColor = trend
    ? (isPositive ? '#22c55e' : '#ef4444')
    : undefined;

  return (
    <div
      className="relative bg-white border border-neutral-200 rounded-xl overflow-hidden p-5 shadow-sm stat-card-glow card-hover-premium"
    >
      {/* Gradient left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{
          background: accentColor
            ? `linear-gradient(180deg, ${accentColor}, ${accentColor}88)`
            : 'linear-gradient(180deg, #6366f1, #8b5cf6, #a855f7)',
        }}
      />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-2">
            <p
              className="text-[1.7rem] font-semibold text-neutral-900 tracking-tight leading-none"
              style={{
                fontVariantNumeric: 'tabular-nums',
                ...(accentColor ? { color: accentColor } : {}),
              }}
            >
              {value}
            </p>
            {trend && (
              <span
                className="text-xs font-medium inline-flex items-center gap-0.5"
                style={{ color: trendColor }}
              >
                {isPositive ? '\u2191' : '\u2193'} {trend.replace(/^[+-]/, '')}
              </span>
            )}
          </div>
          {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
        {icon && <div className="text-neutral-300">{icon}</div>}
      </div>
    </div>
  );
}
