'use client';

import { useState, useMemo } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useModal } from '@/lib/context/ModalContext';
import { PIPELINE_STAGES, type PipelineStage, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';

export default function PipelinePage() {
  const { contacts: allContacts, campaigns, moveContactStage } = usePortal();
  const { openEnrollModal } = useModal();
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    let result = allContacts;
    if (campaignFilter !== 'all') result = result.filter(c => c.campaigns.includes(campaignFilter));
    return result;
  }, [allContacts, campaignFilter]);

  function getLastActivity(contactId: string) {
    // We don't need to import activities for this simple display
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Pipeline Board"
        subtitle={`Track leads through the outreach lifecycle \u2022 ${filteredContacts.length.toLocaleString()} contacts`}
        action={
          <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        }
      />

      {/* Funnel Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = filteredContacts.filter(c => c.stage === stage.key).length;
            const prevCount = i > 0 ? filteredContacts.filter(c => c.stage === PIPELINE_STAGES[i - 1].key).length : 0;
            const convRate = i > 0 && prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
            return (
              <div key={stage.key} className="flex items-center gap-1 flex-1">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: stage.bgColor, color: stage.color }}>
                  <span className="text-base">{stage.icon}</span>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-bold truncate">{stage.label}</p>
                    <p className="text-lg font-extrabold leading-tight">{count}</p>
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="flex flex-col items-center px-1">
                    <span className="text-slate-300 text-sm">&rarr;</span>
                    {i > 0 && <span className="text-[9px] font-bold text-slate-400">{convRate}%</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => openEnrollModal()}
          className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
          Enroll Dormant Contacts
        </button>
        <Link href="/warm-leads" className="text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors">
          View Warm Leads
        </Link>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_STAGES.map((stage, stageIndex) => {
          const stageContacts = filteredContacts
            .filter(c => c.stage === stage.key)
            .sort((a, b) => b.intentScore - a.intentScore);

          return (
            <div key={stage.key} className="flex-shrink-0 w-[260px]">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Column header */}
                <div className="p-4 border-b border-slate-100" style={{ borderTopWidth: '3px', borderTopColor: stage.color }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stage.icon}</span>
                      <span className="text-sm font-bold text-slate-900">{stage.label}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: stage.bgColor, color: stage.color }}>
                      {stageContacts.length}
                    </span>
                  </div>
                  {stage.key === 'dormant' && (
                    <button onClick={() => openEnrollModal()} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">
                      Enroll in campaign &rarr;
                    </button>
                  )}
                  {stage.key === 'intent' && (
                    <Link href="/warm-leads" className="text-[10px] font-semibold text-amber-600 hover:text-amber-800">
                      View in Warm Leads &rarr;
                    </Link>
                  )}
                </div>

                {/* Contact cards */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto bg-slate-50/50">
                  {stageContacts.slice(0, 15).map(contact => {
                    const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
                    const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);

                    return (
                      <div key={contact.id} className="bg-white rounded-xl border border-slate-100 p-3 hover:shadow-md hover:border-blue-200 transition-all">
                        <Link href={`/audience/${contact.id}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[13px] font-semibold text-slate-900 truncate">{contact.firstName} {contact.lastName}</p>
                            {contact.intentScore > 0 && (
                              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                                contact.intentScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                contact.intentScore >= 30 ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>{contact.intentScore}</span>
                            )}
                          </div>

                          {contact.company && <p className="text-[11px] text-slate-600 font-medium truncate">{contact.company}</p>}
                          <p className="text-[10px] text-slate-400 truncate">{contact.email}</p>

                          {contactCampaigns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {contactCampaigns.map(c => {
                                const ccfg = SERVICE_LINE_CONFIG[c.serviceLine];
                                return (
                                  <span key={c.id} className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                                    style={{ backgroundColor: ccfg.bgColor, color: ccfg.color }}>
                                    {ccfg.icon} {ccfg.short}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                            <span className={`text-[10px] ${daysSince > 180 ? 'text-red-500 font-semibold' : daysSince > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {daysSince > 365 ? `${Math.floor(daysSince / 365)}y ago` : `${daysSince}d ago`}
                            </span>
                          </div>

                          {contact.assignedRep && (
                            <p className="text-[9px] text-blue-500 font-medium mt-1">👤 {contact.assignedRep}</p>
                          )}
                        </Link>

                        {stageIndex < PIPELINE_STAGES.length - 1 && (
                          <button onClick={(e) => { e.preventDefault(); moveContactStage(contact.id, PIPELINE_STAGES[stageIndex + 1].key); }}
                            className="mt-2 w-full text-[11px] py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-medium transition-colors border border-slate-100">
                            Advance to {PIPELINE_STAGES[stageIndex + 1].label} &rarr;
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {stageContacts.length > 15 && (
                    <p className="text-[11px] text-slate-400 text-center py-2">+{stageContacts.length - 15} more contacts</p>
                  )}
                  {stageContacts.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-2xl mb-2">🏜️</p>
                      <p className="text-[11px] text-slate-400">No contacts in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
