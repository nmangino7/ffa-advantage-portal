'use client';

import { useState } from 'react';
import { getContacts, getCampaigns } from '@/lib/data';
import { PIPELINE_STAGES, PipelineStage, Contact } from '@/lib/types';
import Link from 'next/link';

export default function PipelinePage() {
  const allContacts = getContacts();
  const campaigns = getCampaigns();
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pipeline Board</h1>
        <p className="text-slate-500 mt-1">Dormant &rarr; Education &rarr; Intent &rarr; Qualified &rarr; Licensed Rep</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={campaignFilter}
          onChange={e => setCampaignFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => {
          const stageContacts = filteredContacts.filter(c => contactStages[c.id] === stage.key);
          const stageIndex = PIPELINE_STAGES.findIndex(s => s.key === stage.key);

          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-64 bg-slate-50 rounded-xl border border-slate-200"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-semibold text-slate-900">{stage.label}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    {stageContacts.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
              </div>

              {/* Contact Cards */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {stageContacts.slice(0, 20).map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    currentStage={stage.key}
                    stageIndex={stageIndex}
                    onMove={moveContact}
                  />
                ))}
                {stageContacts.length > 20 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    +{stageContacts.length - 20} more contacts
                  </p>
                )}
                {stageContacts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No contacts at this stage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContactCard({
  contact,
  currentStage,
  stageIndex,
  onMove,
}: {
  contact: Contact;
  currentStage: PipelineStage;
  stageIndex: number;
  onMove: (id: string, stage: PipelineStage) => void;
}) {
  const canAdvance = stageIndex < PIPELINE_STAGES.length - 1;
  const nextStage = canAdvance ? PIPELINE_STAGES[stageIndex + 1] : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow">
      <Link href={`/contacts/${contact.id}`} className="block">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-900 truncate">
            {contact.firstName} {contact.lastName}
          </p>
          {contact.intentScore > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              contact.intentScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
              contact.intentScore >= 30 ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {contact.intentScore}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{contact.email}</p>
        {contact.company && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{contact.company}</p>
        )}
      </Link>
      {canAdvance && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onMove(contact.id, nextStage!.key);
          }}
          className="mt-2 w-full text-xs py-1 px-2 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors text-center"
        >
          Move to {nextStage!.label} &rarr;
        </button>
      )}
    </div>
  );
}
