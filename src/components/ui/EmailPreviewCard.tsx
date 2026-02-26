'use client';

import { ServiceLineBadge } from './ServiceLineBadge';
import type { ContentTemplate } from '@/lib/types';

export function EmailPreviewCard({
  template,
  expanded,
  onToggle,
}: {
  template: ContentTemplate;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}>
      {/* Header - always visible */}
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <ServiceLineBadge serviceLine={template.serviceLine} size="sm" />
              <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                Email {template.stepNumber} of 4
              </span>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                Day {template.template.sendDay}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {template.template.subject}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {template.template.previewText}
            </p>
            <p className="text-[10px] text-slate-400 mt-1.5">
              From: {template.campaignName}
            </p>
          </div>
          <div className="flex-shrink-0 text-slate-400 mt-1">
            <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4">
          <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="text-[11px] text-slate-400 mb-2 pb-2 border-b border-slate-100 space-y-0.5">
              <p><strong>From:</strong> The FFA North Team</p>
              <p><strong>Subject:</strong> {template.template.subject}</p>
              <p><strong>Preview:</strong> {template.template.previewText}</p>
            </div>
            <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {template.template.body}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Use in Campaign
            </button>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              template.template.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {template.template.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
