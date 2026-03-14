'use client';

import { useRouter } from 'next/navigation';
import { useModal } from '@/lib/context/ModalContext';
import { ServiceLineBadge } from './ServiceLineBadge';
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
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-indigo-200 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <ServiceLineBadge serviceLine={template.serviceLine} size="sm" />
              <span className="text-[10px] text-neutral-400 font-medium">
                Email {template.stepNumber} / 4
              </span>
              <span className="text-[10px] text-neutral-400">
                Day {template.template.sendDay}
              </span>
            </div>
            <h3 className="text-sm font-medium text-neutral-900 leading-snug">
              {template.template.subject}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
              {template.template.previewText}
            </p>
            <p className="text-[10px] text-neutral-400 mt-1">
              {template.campaignName}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-neutral-100 px-4 pb-4">
          <div className="mt-3 bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 space-y-0.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-neutral-400 font-medium w-14">From</span>
                <span className="text-neutral-700">FFA North Team &lt;outreach@ffanorth.com&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-neutral-400 font-medium w-14">Subject</span>
                <span className="text-neutral-900 font-medium">{template.template.subject}</span>
              </div>
              {template.template.previewText && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-neutral-400 font-medium w-14">Preview</span>
                  <span className="text-neutral-500 italic">{template.template.previewText}</span>
                </div>
              )}
            </div>
            <div className="px-4 py-4 text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {template.template.body}
            </div>
            <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
              <p className="text-[10px] text-neutral-400">
                Florida Financial Advisors &bull; 123 Main St, Suite 100 &bull; <span className="text-indigo-500 underline">Unsubscribe</span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => router.push(`/campaigns/new?templateId=${template.template.id}`)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-3 h-3" /> Use in Campaign
            </button>
            <button
              onClick={() => openTemplateModal('edit', template.template.id)}
              className="px-3 py-1.5 bg-white text-neutral-600 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              template.template.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
            }`}>
              {template.template.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
