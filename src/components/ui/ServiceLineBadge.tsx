import { SERVICE_LINE_CONFIG, type ServiceLine } from '@/lib/types';
import { Icon } from './Icon';

export function ServiceLineBadge({
  serviceLine,
  size = 'sm',
}: {
  serviceLine: ServiceLine;
  size?: 'sm' | 'md';
}) {
  const cfg = SERVICE_LINE_CONFIG[serviceLine];
  if (!cfg) return null;

  const sizeClasses = size === 'md' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
      style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
    >
      <Icon name={cfg.icon} className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {cfg.short}
    </span>
  );
}
