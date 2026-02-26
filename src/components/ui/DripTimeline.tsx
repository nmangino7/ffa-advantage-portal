import type { EmailStep } from '@/lib/types';

export function DripTimeline({
  steps,
  color,
  compact = false,
}: {
  steps: EmailStep[];
  color: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-start ${compact ? 'gap-0' : 'gap-0'} w-full`}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex-1 flex items-start">
          {/* Node */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: compact ? 28 : 40 }}>
            <div
              className={`rounded-full flex items-center justify-center text-white font-bold ${compact ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-xs'}`}
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </div>
            <span className={`mt-1 font-medium ${compact ? 'text-[9px]' : 'text-[11px]'} text-slate-400`}>
              Day {step.sendDay}
            </span>
            {!compact && (
              <p className="text-[11px] text-slate-600 font-medium mt-0.5 text-center leading-tight max-w-[120px] line-clamp-2">
                {step.subject}
              </p>
            )}
          </div>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-center pt-3.5" style={{ minWidth: 12 }}>
              <div className={`w-full border-t-2 border-dashed`} style={{ borderColor: color + '40' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
