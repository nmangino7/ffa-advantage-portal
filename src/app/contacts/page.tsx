'use client';

import { useState, useMemo } from 'react';
import { getContacts, getCampaigns } from '@/lib/data';
import { PIPELINE_STAGES, PipelineStage } from '@/lib/types';
import Link from 'next/link';

export default function ContactsPage() {
  const allContacts = getContacts();
  const campaigns = getCampaigns();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'intentScore' | 'lastContactDate'>('intentScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 25;

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
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      else if (sortBy === 'intentScore') cmp = a.intentScore - b.intentScore;
      else cmp = new Date(a.lastContactDate).getTime() - new Date(b.lastContactDate).getTime();
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [allContacts, search, stageFilter, campaignFilter, sortBy, sortDir]);

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
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input type="text" placeholder="Search by name, email, or company..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50" />
          </div>
          <select value={campaignFilter} onChange={e => { setCampaignFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-sm text-slate-400 font-medium">{filtered.length} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Stage</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">Campaigns</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                onClick={() => toggleSort('intentScore')}>Intent {sortBy === 'intentScore' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="text-left py-3 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-700"
                onClick={() => toggleSort('lastContactDate')}>Last Contact {sortBy === 'lastContactDate' && (sortDir === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(contact => {
              const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
              const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
              return (
                <tr key={contact.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/contacts/${contact.id}`} className="font-semibold text-blue-600 hover:text-blue-800">
                      {contact.firstName} {contact.lastName}
                    </Link>
                    {contact.company && <p className="text-[11px] text-slate-400">{contact.company}</p>}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[13px]">{contact.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: sm?.color }}>
                      {sm?.icon} {sm?.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {contactCampaigns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {contactCampaigns.map(c => (
                          <span key={c.id} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                            {c.serviceLine.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-[11px] text-slate-300">None</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-300'}`}>
                      {contact.intentScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[13px]">
                    {new Date(contact.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">{(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
