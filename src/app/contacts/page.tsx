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
  const [sortBy, setSortBy] = useState<'name' | 'intentScore' | 'lastContactDate'>('lastContactDate');
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

    if (stageFilter !== 'all') {
      result = result.filter(c => c.stage === stageFilter);
    }

    if (campaignFilter !== 'all') {
      result = result.filter(c => c.campaigns.includes(campaignFilter));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'intentScore') {
        cmp = a.intentScore - b.intentScore;
      } else {
        cmp = new Date(a.lastContactDate).getTime() - new Date(b.lastContactDate).getTime();
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [allContacts, search, stageFilter, campaignFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        <p className="text-slate-500 mt-1">{allContacts.length.toLocaleString()} contacts in database</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={e => { setStageFilter(e.target.value as PipelineStage | 'all'); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {PIPELINE_STAGES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={e => { setCampaignFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <span className="text-sm text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th
                  className="text-left py-3 px-4 text-slate-500 font-medium cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('name')}
                >
                  Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Stage</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Campaigns</th>
                <th
                  className="text-left py-3 px-4 text-slate-500 font-medium cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('intentScore')}
                >
                  Intent {sortBy === 'intentScore' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-left py-3 px-4 text-slate-500 font-medium cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('lastContactDate')}
                >
                  Last Contact {sortBy === 'lastContactDate' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map(contact => {
                const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);
                const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
                return (
                  <tr key={contact.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {contact.firstName} {contact.lastName}
                      </Link>
                      {contact.company && (
                        <p className="text-xs text-slate-400">{contact.company}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{contact.email}</td>
                    <td className="py-3 px-4 text-slate-600">{contact.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: stageMeta?.color }}
                      >
                        {stageMeta?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contactCampaigns.length > 0 ? contactCampaigns.map(camp => (
                          <span key={camp.id} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {camp.serviceLine.split(' ')[0]}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-300">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        contact.intentScore >= 70 ? 'text-emerald-600' :
                        contact.intentScore >= 30 ? 'text-amber-600' :
                        'text-slate-400'
                      }`}>
                        {contact.intentScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(contact.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm rounded border ${
                      p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
