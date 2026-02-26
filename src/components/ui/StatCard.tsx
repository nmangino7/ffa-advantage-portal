export function StatCard({
  value,
  label,
  sub,
  icon,
  variant = 'flat',
  accentColor,
}: {
  value: string | number;
  label: string;
  sub?: string;
  icon?: string;
  variant?: 'flat' | 'outlined' | 'accent';
  accentColor?: string;
}) {
  const baseClasses = 'rounded-2xl p-5 transition-all';
  const variantClasses = {
    flat: 'bg-white border border-slate-200 shadow-sm',
    outlined: 'bg-white border-2 border-slate-200',
    accent: 'bg-white border border-slate-200 shadow-sm',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      {variant === 'accent' && accentColor && (
        <div className="h-1 rounded-full mb-3 -mt-1" style={{ backgroundColor: accentColor }} />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accentColor ? '' : 'text-slate-900'}`}
            style={accentColor ? { color: accentColor } : {}}>
            {value}
          </p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  );
}
