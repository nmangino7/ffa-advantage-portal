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
  const color = accentColor || '#3b82f6';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group relative overflow-hidden">
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: color + '12' }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
