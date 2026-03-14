import { PIPELINE_STAGES, type PipelineStage } from '@/lib/types';
import { Icon } from './Icon';

export function StageBadge({
  stage,
  size = 'sm',
}: {
  stage: PipelineStage;
  size?: 'sm' | 'md';
}) {
  const meta = PIPELINE_STAGES.find((s) => s.key === stage);
  if (!meta) return null;

  const sizeClasses = size === 'md' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
      style={{ backgroundColor: meta.bgColor, color: meta.color }}
    >
      <Icon name={meta.icon} className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {meta.label}
    </span>
  );
}
