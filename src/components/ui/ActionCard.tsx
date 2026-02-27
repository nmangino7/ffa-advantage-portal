'use client';

import Link from 'next/link';
import { useModal } from '@/lib/context/ModalContext';
import type { WarmLead } from '@/lib/types';
import { UserPlus, Phone, Eye, MessageSquare, Info, MousePointerClick, CheckCircle, RefreshCw } from 'lucide-react';

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; iconName: string }> = {
  replied: { label: 'Replied', color: '#dc2626', bg: '#fef2f2', iconName: 'message-square' },
  info_requested: { label: 'Requested Info', color: '#d97706', bg: '#fffbeb', iconName: 'info' },
  engaged: { label: 'Engaged', color: '#ca8a04', bg: '#fefce8', iconName: 'mouse-click' },
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
  const campaignObj = lead.lastAction.campaignName ? lead.campaignName : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
      {/* Accent top bar */}
      <div className="h-1" style={{ backgroundColor: tc.color }} />

      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: tc.color }}>
          {lead.contact.firstName[0]}{lead.contact.lastName[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + tier badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/audience/${lead.contact.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
              {lead.contact.firstName} {lead.contact.lastName}
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1"
              style={{ backgroundColor: tc.bg, color: tc.color }}>
              <TierIcon className="w-3 h-3" />
              {tc.label}
            </span>
            {lead.contact.intentScore > 0 && (
              <span className={`text-[10px] font-bold ${lead.contact.intentScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Intent: {lead.contact.intentScore}
              </span>
            )}
          </div>

          {/* Company */}
          {lead.contact.company && (
            <p className="text-xs text-slate-500">{lead.contact.company}</p>
          )}

          {/* What they did */}
          <p className="text-xs text-slate-600 mt-1">
            {lead.lastAction.description}
          </p>

          {/* Email reply content */}
          {lead.lastAction.emailBody && (
            <div className="mt-2 bg-slate-50 border-l-3 border-slate-300 rounded-r-lg p-3">
              {lead.lastAction.emailSubject && (
                <p className="text-[10px] font-semibold text-slate-600 mb-0.5">{lead.lastAction.emailSubject}</p>
              )}
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic">{lead.lastAction.emailBody}</p>
            </div>
          )}

          {/* Campaign + time */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {campaignObj && (
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                {lead.campaignName}
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              {lead.daysSinceAction === 0 ? 'Today' : lead.daysSinceAction === 1 ? 'Yesterday' : `${lead.daysSinceAction} days ago`}
            </span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 mt-3">
            {lead.contact.assignedRep ? (
              <>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" /> Assigned to {lead.contact.assignedRep}
                </span>
                <button onClick={() => openAssignModal(lead.contact.id)} className="px-3 py-1.5 text-slate-500 text-[11px] font-semibold hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Reassign
                </button>
              </>
            ) : (
              <button onClick={() => openAssignModal(lead.contact.id)} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5">
                <UserPlus className="w-3 h-3" /> Assign Advisor
              </button>
            )}
            <button onClick={() => openScheduleModal(lead.contact.id)} className="px-3 py-1.5 bg-white text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Schedule Call
            </button>
            <Link href={`/audience/${lead.contact.id}`}
              className="px-3 py-1.5 text-blue-600 text-[11px] font-semibold hover:text-blue-800 transition-colors inline-flex items-center gap-1">
              <Eye className="w-3 h-3" /> View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
