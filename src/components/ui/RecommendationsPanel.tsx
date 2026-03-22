'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePortal } from '@/lib/context/PortalContext';
import { generateRecommendations } from '@/lib/recommendations';
import { Icon } from './Icon';
import { Sparkles } from 'lucide-react';

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
};

const PRIORITY_GLOW: Record<string, string> = {
  high: '0 0 6px rgba(239, 68, 68, 0.4)',
  medium: '0 0 6px rgba(245, 158, 11, 0.3)',
  low: '0 0 6px rgba(96, 165, 250, 0.3)',
};

export function RecommendationsPanel() {
  const { contacts, campaigns, activities } = usePortal();

  const recommendations = useMemo(
    () => generateRecommendations(contacts, campaigns, activities),
    [contacts, campaigns, activities]
  );

  if (recommendations.length === 0) return null;

  return (
    <div className="glass-card-premium rounded-xl overflow-hidden gradient-border-animated">
      {/* Gradient left border accent */}
      <div className="flex">
        <div className="flex-1 p-5 pl-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-900">Smart Recommendations</h2>
            <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
              {recommendations.length}
            </span>
          </div>

          {/* Recommendations list */}
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 group"
              >
                {/* Priority dot with glow */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${PRIORITY_DOT[rec.priority]}`}
                    style={{ boxShadow: PRIORITY_GLOW[rec.priority] }}
                  />
                </div>

                {/* Icon */}
                <div className="w-7 h-7 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name={rec.icon} className="w-3.5 h-3.5 text-neutral-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{rec.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{rec.description}</p>
                </div>

                {/* CTA with gradient hover */}
                <Link
                  href={rec.actionHref}
                  className="shrink-0 px-3 py-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 rounded-full hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white transition-all duration-300"
                >
                  {rec.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
