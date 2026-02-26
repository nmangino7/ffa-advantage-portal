'use client';

import { useState, useMemo } from 'react';
import { PIPELINE_STAGES, type PipelineStage, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';

export default function AudiencePage() {
  const { openEnrollModal } = useModal();
  const { contacts: allContacts, campaigns } = usePortal();

  const segments = useMemo(() => {
    return PIPELINE_STAGES.map(stage => {
      const stageContacts = allContacts.filter(c => c.stage === stage.key);
      const avgIntent = stageContacts.length > 0
        ? Math.round(stageContacts.reduce((s, c) => s + c.intentScore, 0) / stageContacts.length)
        : 0;
      const unassignedCount = stageContacts.filter(c => !c.assignedRep).length;
      const notInCampaignCount = stageContacts.filter(c => c.campaigns.length === 0).length;
      return { stage, count: stageContacts.length, avgIntent, unassignedCount, notInCampaignCount };
    });
  }, [allContacts]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'intentScore' | 'lastContactDate'>('intentScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const dormantSegment = segments.find(s => s.stage.key === 'dormant');
  const dormantNotInCampaign = dormantSegment?.notInCampaignCount || 0;

  const filtered = useMemo(() => {
    let result = [...allContacts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'all') result = result.filter(c => c.stage === stageFilter);
    if (campaignFilter !== 'all') result = result.filter(c => c.campaigns.includes(campaignFilter));
    if (intentFilter === 'hot') result = result.filter(c => c.intentScore >= 70);
    if (intentFilter === 'warm') result = result.filter(c => c.intentScore >= 30 && c.intentScore < 70);
    if (intentFilter === 'cold') result = result.filter(c => c.intentScore < 30);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortBy === 'intentScore') cmp = a.intentScore - b.intentScore;
      else cmp = new Date(a.lastContactDate).getTime() - new Date(b.lastContactDate).getTime();
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [allContacts, search, stageFilter, campaignFilter, intentFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  }

  return (
    <div className="max-w-[1300px]">
      <PageHeader
        title="Audience"
        subtitle={`${allContacts.length.toLocaleString()} contacts segmented by engagement stage`}
        action={
          <button onClick={() => openEnrollModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Enroll in Campaign
          </button>
        }
      />

      {/* Segment Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {segments.map(seg => (
          <button key={seg.stage.key}
            onClick={() => { setStageFilter(stageFilter === seg.stage.key ? 'all' : seg.stage.key); setPage(1); }}
            className={`rounded-2xl p-4 text-left transition-all border-2 ${
              stageFilter === seg.stage.key
                ? 'shadow-md'
                : 'border-slate-200 bg-white hover:shadow-sm'
            }`}
            style={stageFilter === seg.stage.key ? { borderColor: seg.stage.color, backgroundColor: seg.stage.bgColor } : {}}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{seg.stage.icon}</span>
              <span className="text-xs font-semibold" style={{ color: seg.stage.color }}>{seg.stage.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{seg.count}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {seg.notInCampaignCount > 0 ? `${seg.notInCampaignCount} not in campaign` : 'All enrolled'}
            </p>
          </button>
        ))}
      </div>

      {/* Dormant Alert Banner */}
      {dormantNotInCampaign > 0 && stageFilter === 'all' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💤</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                You have <strong>{dormantNotInCampaign} dormant contacts</strong> who haven&apos;t been reached yet.
              </p>
              <p className="text-xs text-amber-700">Enroll them in a campaign to start re-engagement.</p>
            </div>
          </div>
          <button onClick={() => openEnrollModal()}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0">
            Enroll Dormant Contacts
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <input type="text" placeholder="Search by name, email, or company..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" />
          </div>
          <select value={campaignFilter} onChange={e => { setCampaignFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={intentFilter} onChange={e => { setIntentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Intent Levels</option>
            <option value="hot">Hot (≥70)</option>
            <option value="warm">Warm (30-69)</option>
            <option value="cold">Cold (&lt;30)</option>
          </select>
          <span className="text-sm text-slate-400 font-medium">{filtered.length} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Company</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Stage</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Campaigns</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('intentScore')}>Intent {sortBy === 'intentScore' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('lastContactDate')}>Last Contact {sortBy === 'lastContactDate' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(contact => {
                const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
                const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);

                return (
                  <tr key={contact.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/audience/${contact.id}`} className="font-semibold text-blue-600 hover:text-blue-800 text-[13px]">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[13px]">{contact.company || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap" style={{ backgroundColor: sm?.color }}>
                        {sm?.icon} {sm?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {contactCampaigns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {contactCampaigns.map(c => {
                            const cfg = SERVICE_LINE_CONFIG[c.serviceLine];
                            return (
                              <span key={c.id} className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                                style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                                {cfg.short}
                              </span>
                            );
                          })}
                        </div>
                      ) : <span className="text-[10px] text-slate-300">None</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${contact.intentScore}%`,
                            backgroundColor: contact.intentScore >= 70 ? '#059669' : contact.intentScore >= 30 ? '#d97706' : '#94a3b8'
                          }} />
                        </div>
                        <span className={`font-bold text-xs ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {contact.intentScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${daysSince > 365 ? 'text-red-500 font-semibold' : daysSince > 180 ? 'text-amber-500' : 'text-slate-500'}`}>
                        {daysSince}d ago
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/audience/${contact.id}`}
                          className="px-2.5 py-1 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                          View
                        </Link>
                        {contact.stage === 'dormant' && contact.campaigns.length === 0 && (
                          <button onClick={() => openEnrollModal(contact.id)}
                            className="px-2.5 py-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors">
                            Enroll
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">{(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
