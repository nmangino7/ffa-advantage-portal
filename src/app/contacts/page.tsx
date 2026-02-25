'use client';

import { useState, useMemo } from 'react';
import { getContacts, getCampaigns, getContactEngagement } from '@/lib/data';
import { PIPELINE_STAGES, PipelineStage, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';

export default function ContactsPage() {
  const allContacts = getContacts();
  const campaigns = getCampaigns();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'intentScore' | 'lastContactDate' | 'engagement'>('intentScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Contact engagement cache
  const engagementMap = useMemo(() => {
    const map: Record<string, { totalActions: number; replies: number; appointments: number }> = {};
    allContacts.forEach(c => {
      map[c.id] = getContactEngagement(c.id);
    });
    return map;
  }, [allContacts]);

  // Summary stats
  const avgIntent = allContacts.length > 0 ? Math.round(allContacts.reduce((s, c) => s + c.intentScore, 0) / allContacts.length) : 0;
  const hotLeads = allContacts.filter(c => c.intentScore >= 50).length;
  const dormant1Yr = allContacts.filter(c => {
    const days = (Date.now() - new Date(c.lastContactDate).getTime()) / 86400000;
    return days > 365;
  }).length;
  const withCampaigns = allContacts.filter(c => c.campaigns.length > 0).length;

  const filtered = useMemo(() => {
    let result = [...allContacts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        (c.assignedRep || '').toLowerCase().includes(q)
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
      else if (sortBy === 'engagement') cmp = (engagementMap[a.id]?.totalActions || 0) - (engagementMap[b.id]?.totalActions || 0);
      else cmp = new Date(a.lastContactDate).getTime() - new Date(b.lastContactDate).getTime();
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [allContacts, search, stageFilter, campaignFilter, intentFilter, sortBy, sortDir, engagementMap]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Contacts</h1>
        <p className="text-slate-500 mt-1 text-[15px]">{allContacts.length.toLocaleString()} contacts in your database</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Avg Intent Score</p>
          <p className={`text-2xl font-extrabold mt-0.5 ${avgIntent >= 50 ? 'text-amber-600' : 'text-slate-900'}`}>{avgIntent}<span className="text-sm text-slate-400">/100</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Hot Leads (≥50)</p>
          <p className="text-2xl font-extrabold mt-0.5 text-emerald-600">{hotLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">In Campaigns</p>
          <p className="text-2xl font-extrabold mt-0.5 text-blue-600">{withCampaigns}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dormant &gt;1 Year</p>
          <p className="text-2xl font-extrabold mt-0.5 text-red-500">{dormant1Yr}</p>
        </div>
      </div>

      {/* Stage Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => { setStageFilter('all'); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          All ({allContacts.length})
        </button>
        {PIPELINE_STAGES.map(s => {
          const count = allContacts.filter(c => c.stage === s.key).length;
          return (
            <button key={s.key} onClick={() => { setStageFilter(s.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                stageFilter === s.key ? 'text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              style={stageFilter === s.key ? { backgroundColor: s.color } : { color: s.color }}>
              <span>{s.icon}</span> {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <input type="text" placeholder="Search by name, email, company, or rep..." value={search}
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
            <option value="hot">🔥 Hot (≥70)</option>
            <option value="warm">🟡 Warm (30-69)</option>
            <option value="cold">❄️ Cold (&lt;30)</option>
          </select>
          <span className="text-sm text-slate-400 font-medium">{filtered.length} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Company</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Stage</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Campaigns</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('intentScore')}>Intent {sortBy === 'intentScore' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('engagement')}>Engagement {sortBy === 'engagement' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort('lastContactDate')}>Last Contact {sortBy === 'lastContactDate' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Rep</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(contact => {
                const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
                const eng = engagementMap[contact.id];
                const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);

                return (
                  <tr key={contact.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/contacts/${contact.id}`} className="font-semibold text-blue-600 hover:text-blue-800 text-[13px]">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[13px]">{contact.company || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap" style={{ backgroundColor: sm?.color }}>
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
                                {cfg.icon} {c.serviceLine.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      ) : <span className="text-[11px] text-slate-300">None</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${contact.intentScore}%`,
                            backgroundColor: contact.intentScore >= 70 ? '#059669' : contact.intentScore >= 30 ? '#d97706' : '#94a3b8'
                          }} />
                        </div>
                        <span className={`font-bold text-[13px] ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {contact.intentScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {eng && eng.totalActions > 0 ? (
                          <>
                            <span className="text-slate-500">{eng.totalActions} acts</span>
                            {eng.replies > 0 && <span className="text-emerald-600 font-semibold">{eng.replies} 💬</span>}
                            {eng.appointments > 0 && <span className="text-violet-600 font-semibold">{eng.appointments} 📅</span>}
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[13px] font-medium ${daysSince > 365 ? 'text-red-500' : daysSince > 180 ? 'text-red-400' : daysSince > 90 ? 'text-amber-500' : 'text-slate-500'}`}>
                        {daysSince > 365 ? `${Math.floor(daysSince / 365)}y ${daysSince % 365}d` : `${daysSince}d ago`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-slate-500">
                      {contact.assignedRep || <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">{(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 text-xs rounded-lg border ${pageNum === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
