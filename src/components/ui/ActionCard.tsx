'use client';

import Link from 'next/link';
import { useModal } from '@/lib/context/ModalContext';
import type { WarmLead } from '@/lib/types';
import { UserPlus, Phone, Eye, MessageSquare, Info, MousePointerClick, CheckCircle, RefreshCw } from 'lucide-react';

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  replied: { label: 'Replied', color: '#dc2626', bg: '#fef2f2' },
  info_requested: { label: 'Requested Info', color: '#d97706', bg: '#fffbeb' },
  engaged: { label: 'Engaged', color: '#ca8a04', bg: '#fefce8' },
};

const TIER_ICON: Record<string, typeof MessageSquare> = {
  replied: MessageSquare,
  info_requested: Info,
  engaged: MousePointerClick,
};

export function ActionCard({ lead }: { lead: WarmLead }) {
  const { openAssignModal, openScheduleModal } = useModal();
  const tc = TIER_CONFIG[lead.tier];
  const TierIcon = TIER_ICON[lead.tier] || MessageSquare;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-200 p-4 card-hover-premium">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
          style={{ backgroundColor: tc.color }}
        >
          {lead.contact.firstName[0]}{lead.contact.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + tier */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/audience/${lead.contact.id}`} className="text-sm font-medium text-neutral-900 hover:text-indigo-600 transition-colors">
              {lead.contact.firstName} {lead.contact.lastName}
            </Link>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-0.5"
              style={{
                backgroundColor: tc.bg,
                color: tc.color,
                boxShadow: `0 0 6px ${tc.color}20`,
              }}
            >
              <TierIcon className="w-2.5 h-2.5" />
              {tc.label}
            </span>
            {lead.contact.intentScore > 0 && (
              <span className="text-[10px] font-medium text-neutral-400 tabular-nums">
                Intent {lead.contact.intentScore}
              </span>
            )}
          </div>

          {lead.contact.company && (
            <p className="text-xs text-neutral-500 mt-0.5">{lead.contact.company}</p>
          )}

          <p className="text-xs text-neutral-600 mt-1">{lead.lastAction.description}</p>

          {/* Reply snippet with gradient left border */}
          {lead.lastAction.emailBody && (
            <div
              className="mt-2 rounded-r-md px-3 py-2"
              style={{
                borderLeft: 'none',
                background: `linear-gradient(to right, ${tc.bg}, transparent)`,
                position: 'relative',
              }}
            >
              {/* Gradient left border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md"
                style={{
                  background: `linear-gradient(180deg, ${tc.color}, ${tc.color}44)`,
                }}
              />
              {lead.lastAction.emailSubject && (
                <p className="text-[10px] font-medium text-neutral-600 mb-0.5">{lead.lastAction.emailSubject}</p>
              )}
              <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2 italic">{lead.lastAction.emailBody}</p>
            </div>
          )}

          {/* Campaign + time */}
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
            {lead.campaignName && (
              <span className="bg-neutral-50 px-1.5 py-0.5 rounded">{lead.campaignName}</span>
            )}
            <span>
              {lead.daysSinceAction === 0 ? 'Today' : lead.daysSinceAction === 1 ? 'Yesterday' : `${lead.daysSinceAction}d ago`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {lead.contact.assignedRep ? (
              <>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-md border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {lead.contact.assignedRep}
                </span>
                <button
                  onClick={() => openAssignModal(lead.contact.id)}
                  className="px-2.5 py-1 text-neutral-500 text-[11px] font-medium hover:text-indigo-600 transition-all duration-200 inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reassign
                </button>
              </>
            ) : (
              <button
                onClick={() => openAssignModal(lead.contact.id)}
                className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-medium rounded-md hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/20 inline-flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> Assign Advisor
              </button>
            )}
            <button
              onClick={() => openScheduleModal(lead.contact.id)}
              className="px-2.5 py-1 bg-white text-neutral-600 text-[11px] font-medium rounded-md border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 inline-flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> Schedule Call
            </button>
            <Link
              href={`/audience/${lead.contact.id}`}
              className="px-2.5 py-1 text-indigo-600 text-[11px] font-medium hover:text-indigo-800 transition-all duration-200 inline-flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
