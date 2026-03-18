'use client';

import { useState, useMemo, useEffect } from 'react';
import { PIPELINE_STAGES, type PipelineStage, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { Users } from 'lucide-react';

export default function AudiencePage() {
  const { openEnrollModal, openImportModal } = useModal();
  const { contacts: allContacts, campaigns, isHydrated } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => setLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

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

  if (loading || !isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="stat" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} variant="row" />)}
        </div>
      </div>
    );
  }

  if (allContacts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeader
          title="Audience"
          subtitle="0 contacts"
        />
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 mb-1">No contacts yet</h3>
          <p className="text-sm text-neutral-500">Import contacts to start building your audience segments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      <PageHeader
        title="Audience"
        subtitle={`${allContacts.length.toLocaleString()} contacts segmented by engagement stage`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => openImportModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
              <Icon name="upload" className="w-4 h-4" />
              Import Contacts
            </button>
            <button onClick={() => openEnrollModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
              Enroll in Campaign
            </button>
          </div>
        }
      />

      {/* Segment Chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {segments.map(seg => {
          const isActive = stageFilter === seg.stage.key;
          return (
            <button key={seg.stage.key}
              onClick={() => { setStageFilter(stageFilter === seg.stage.key ? 'all' : seg.stage.key); setPage(1); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:shadow-sm'
              }`}
              style={isActive ? { backgroundColor: seg.stage.color } : { borderLeftWidth: '3px', borderLeftColor: seg.stage.color }}>
              <Icon name={seg.stage.icon} className="w-4 h-4" />
              <span>{seg.stage.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-indigo-500 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dormant Alert Banner */}
      {dormantNotInCampaign > 0 && stageFilter === 'all' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Icon name="moon" className="w-5 h-5 text-amber-600" />
            </div>
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
      <div className="flex gap-3 items-center flex-wrap mb-4">
        <div className="flex-1 min-w-[250px]">
          <input type="text" placeholder="Search by name, email, or company..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white" />
        </div>
        <select value={campaignFilter} onChange={e => { setCampaignFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-600">
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={intentFilter} onChange={e => { setIntentFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-600">
          <option value="all">All Intent Levels</option>
          <option value="hot">Hot (&ge;70)</option>
          <option value="warm">Warm (30-69)</option>
          <option value="cold">Cold (&lt;30)</option>
        </select>
        <span className="text-sm text-neutral-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-neutral-900"
                  onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Company</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Stage</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-neutral-900"
                  onClick={() => toggleSort('intentScore')}>Intent {sortBy === 'intentScore' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Campaigns</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-neutral-900"
                  onClick={() => toggleSort('lastContactDate')}>Last Contact {sortBy === 'lastContactDate' && (sortDir === 'asc' ? '\u2191' : '\u2193')}</th>
                <th className="text-left py-3 px-4 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paged.map(contact => {
                const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
                const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);

                return (
                  <tr key={contact.id} className="hover:bg-neutral-50 transition-all duration-200 hover:shadow-sm">
                    <td className="py-3 px-4">
                      <Link href={`/audience/${contact.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800 text-[13px]">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[13px]">{contact.company || '\u2014'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap inline-flex items-center gap-1"
                        style={{ backgroundColor: sm?.bgColor || '#f1f5f9', color: sm?.color || '#64748b' }}>
                        <Icon name={sm?.icon || 'moon'} className="w-3 h-3" /> {sm?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold text-sm ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-neutral-400'}`}>
                        {contact.intentScore}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {contactCampaigns.length > 0 ? (
                        <span className="text-xs text-neutral-500">{contactCampaigns.length} campaign{contactCampaigns.length !== 1 ? 's' : ''}</span>
                      ) : <span className="text-xs text-neutral-300">None</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${daysSince > 365 ? 'text-red-500 font-semibold' : daysSince > 180 ? 'text-amber-500' : 'text-neutral-500'}`}>
                        {daysSince}d ago
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/audience/${contact.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors">
                          View
                        </Link>
                        {contact.stage === 'dormant' && contact.campaigns.length === 0 && (
                          <button onClick={() => openEnrollModal(contact.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors">
                            Enroll
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-neutral-500">
                    No contacts match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
