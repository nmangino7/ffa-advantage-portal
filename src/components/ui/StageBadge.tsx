import { PIPELINE_STAGES, type PipelineStage } from '@/lib/types';

export function StageBadge({
  stage,
  size = 'sm',
}: {
  stage: PipelineStage;
  size?: 'sm' | 'md';
}) {
  const meta = PIPELINE_STAGES.find(s => s.key === stage);
  if (!meta) return null;

  const sizeClasses = size === 'md'
    ? 'text-xs px-3 py-1 gap-1.5'
    : 'text-[10px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${sizeClasses}`}
      style={{ backgroundColor: meta.color }}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
