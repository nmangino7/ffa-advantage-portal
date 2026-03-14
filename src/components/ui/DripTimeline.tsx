import type { EmailStep } from '@/lib/types';
import { Mail } from 'lucide-react';

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
    <div className="flex items-start w-full">
      {steps.map((step, i) => (
        <div key={step.id} className="flex-1 flex items-start">
          <div className="flex flex-col items-center shrink-0" style={{ minWidth: compact ? 28 : 40 }}>
            <div
              className={`rounded-full flex items-center justify-center text-white font-medium ${compact ? 'w-6 h-6' : 'w-9 h-9'}`}
              style={{ backgroundColor: color }}
            >
              {compact ? (
                <span className="text-[9px]">{i + 1}</span>
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
            </div>
            <span className={`mt-1 font-medium text-neutral-400 ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
              Day {step.sendDay}
            </span>
            {!compact && step.subject && (
              <p className="text-[10px] text-neutral-500 mt-0.5 text-center leading-tight max-w-[120px] line-clamp-2">
                {step.subject}
              </p>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-center pt-3" style={{ minWidth: 12 }}>
              <div className="w-full h-px bg-neutral-200" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
