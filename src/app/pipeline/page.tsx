'use client';

import { useState } from 'react';
import { getContacts, getCampaigns } from '@/lib/data';
import { PIPELINE_STAGES, PipelineStage, Contact } from '@/lib/types';
import Link from 'next/link';

export default function PipelinePage() {
  const allContacts = getContacts();
  const campaigns = getCampaigns();
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [contactStages, setContactStages] = useState<Record<string, PipelineStage>>(() => {
    const map: Record<string, PipelineStage> = {};
    allContacts.forEach(c => { map[c.id] = c.stage; });
    return map;
  });

  const filteredContacts = allContacts.filter(c => {
    if (campaignFilter !== 'all' && !c.campaigns.includes(campaignFilter)) return false;
    return true;
  });

  function moveContact(contactId: string, newStage: PipelineStage) {
    setContactStages(prev => ({ ...prev, [contactId]: newStage }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Pipeline Board</h1>
          <p className="text-slate-500 mt-1 text-[15px]">Drag leads through the outreach lifecycle</p>
        </div>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Funnel summary */}
      <div className="flex items-center gap-2 mb-6">
        {PIPELINE_STAGES.map((stage, i) => {
          const count = filteredContacts.filter(c => contactStages[c.id] === stage.key).length;
          return (
            <div key={stage.key} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: stage.bgColor, color: stage.color }}>
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
                <span className="ml-1 bg-white/80 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && <span className="text-slate-300 text-lg">&rarr;</span>}
            </div>
          );
        })}
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_STAGES.map((stage, stageIndex) => {
          const stageContacts = filteredContacts.filter(c => contactStages[c.id] === stage.key);
          return (
            <div key={stage.key} className="flex-shrink-0 w-[260px]">
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-100" style={{ borderTopWidth: '3px', borderTopColor: stage.color }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{stage.icon}</span>
                      <span className="text-sm font-bold text-slate-900">{stage.label}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: stage.bgColor, color: stage.color }}>
                      {stageContacts.length}
                    </span>
                  </div>
                </div>
                <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto bg-slate-50/50">
                  {stageContacts.slice(0, 15).map(contact => (
                    <div key={contact.id} className="bg-white rounded-xl border border-slate-100 p-3 hover:shadow-sm transition-shadow">
                      <Link href={`/contacts/${contact.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{contact.firstName} {contact.lastName}</p>
                          {contact.intentScore > 0 && (
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                              contact.intentScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                              contact.intentScore >= 30 ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>{contact.intentScore}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{contact.email}</p>
                        {contact.company && <p className="text-[11px] text-slate-400 truncate">{contact.company}</p>}
                      </Link>
                      {stageIndex < PIPELINE_STAGES.length - 1 && (
                        <button onClick={() => moveContact(contact.id, PIPELINE_STAGES[stageIndex + 1].key)}
                          className="mt-2 w-full text-[11px] py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-medium transition-colors">
                          Move to {PIPELINE_STAGES[stageIndex + 1].label} &rarr;
                        </button>
                      )}
                    </div>
                  ))}
                  {stageContacts.length > 15 && (
                    <p className="text-[11px] text-slate-400 text-center py-2">+{stageContacts.length - 15} more</p>
                  )}
                  {stageContacts.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-10">Empty</p>
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
