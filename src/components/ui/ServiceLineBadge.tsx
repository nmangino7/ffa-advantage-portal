import { SERVICE_LINE_CONFIG, type ServiceLine } from '@/lib/types';

export function ServiceLineBadge({
  serviceLine,
  size = 'sm',
}: {
  serviceLine: ServiceLine;
  size?: 'sm' | 'md';
}) {
  const cfg = SERVICE_LINE_CONFIG[serviceLine];
  const sizeClasses = size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[10px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses}`}
      style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.short}</span>
    </span>
  );
}
