import type { ReactNode } from 'react';

export function StatCard({
  value,
  label,
  sub,
  icon,
  accentColor,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
  icon?: ReactNode;
  accentColor?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 transition-colors hover:border-neutral-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-neutral-900 tracking-tight tabular-nums" style={accentColor ? { color: accentColor } : undefined}>
            {value}
          </p>
          {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
        {icon && <div className="text-neutral-300">{icon}</div>}
      </div>
    </div>
  );
}
