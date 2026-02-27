'use client';

import { useRouter } from 'next/navigation';
import { useModal } from '@/lib/context/ModalContext';
import { ServiceLineBadge } from './ServiceLineBadge';
import { Icon } from './Icon';
import type { ContentTemplate } from '@/lib/types';
import { ChevronDown, Pencil, ArrowRight } from 'lucide-react';

export function EmailPreviewCard({
  template,
  expanded,
  onToggle,
}: {
  template: ContentTemplate;
  expanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const { openTemplateModal } = useModal();

  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-blue-200 shadow-lg' : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}>
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
            <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4">
          {/* Email Chrome */}
          <div className="mt-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Email Header Bar */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 space-y-0.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-medium w-14">From</span>
                <span className="text-slate-700">The FFA North Team &lt;outreach@ffanorth.com&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-medium w-14">Subject</span>
                <span className="text-slate-900 font-semibold">{template.template.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-medium w-14">Preview</span>
                <span className="text-slate-500 italic">{template.template.previewText}</span>
              </div>
            </div>
            {/* Email Body */}
            <div className="px-4 py-4 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {template.template.body}
            </div>
            {/* Email Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] text-slate-400">
                Florida Financial Advisors &bull; 123 Main St, Suite 100 &bull; <span className="text-blue-500 underline">Unsubscribe</span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => router.push(`/campaigns/new?templateId=${template.template.id}`)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3" /> Use in Campaign
            </button>
            <button onClick={() => openTemplateModal('edit', template.template.id)}
              className="px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Edit
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
