'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import type { WarmLead, WarmLeadTier } from '@/lib/types';
import { ActionCard } from '@/components/ui/ActionCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Flame, Zap, CalendarDays, CheckCircle2 } from 'lucide-react';

const TIER_META: Record<WarmLeadTier, { label: string; description: string; color: string; bg: string }> = {
  replied: { label: 'Replied', description: 'These contacts responded directly — highest priority', color: '#dc2626', bg: '#fef2f2' },
  info_requested: { label: 'Requested Info', description: 'Asked for more information about a service', color: '#d97706', bg: '#fffbeb' },
  engaged: { label: 'Engaged', description: 'Multiple opens or clicks — showing strong interest', color: '#ca8a04', bg: '#fefce8' },
};

export default function WarmLeadsPage() {
  const { contacts, campaigns, activities, isHydrated } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => setLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);
  const [tierFilter, setTierFilter] = useState<WarmLeadTier | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const allLeads = useMemo(() => {
    const highValueTypes: Record<string, WarmLeadTier> = {
      'reply_received': 'replied',
      'info_requested': 'info_requested',
      'appointment_scheduled': 'replied',
    };
    const leadMap = new Map<string, WarmLead>();
    for (const act of activities) {
      const tier = highValueTypes[act.type];
      if (!tier) continue;
      const contact = contacts.find(c => c.id === act.contactId);
      if (!contact) continue;
      const existing = leadMap.get(contact.id);
      const tierPriority: Record<WarmLeadTier, number> = { replied: 1, info_requested: 2, engaged: 3 };
      if (!existing || tierPriority[tier] < tierPriority[existing.tier]) {
        const daysSinceAction = Math.floor((Date.now() - new Date(act.timestamp).getTime()) / 86400000);
        leadMap.set(contact.id, { contact, tier, lastAction: act, campaignName: act.campaignName || 'Direct', daysSinceAction });
      }
    }
    for (const act of activities) {
      if (act.type !== 'email_clicked') continue;
      const contact = contacts.find(c => c.id === act.contactId);
      if (!contact || contact.intentScore < 30 || leadMap.has(contact.id)) continue;
      const daysSinceAction = Math.floor((Date.now() - new Date(act.timestamp).getTime()) / 86400000);
      leadMap.set(contact.id, { contact, tier: 'engaged', lastAction: act, campaignName: act.campaignName || 'Direct', daysSinceAction });
    }
    const tierOrder: Record<WarmLeadTier, number> = { replied: 0, info_requested: 1, engaged: 2 };
    return Array.from(leadMap.values()).sort((a, b) => {
      const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
      return tierDiff !== 0 ? tierDiff : a.daysSinceAction - b.daysSinceAction;
    });
  }, [contacts, activities]);

  const filtered = useMemo(() => {
    let result = allLeads;
    if (tierFilter !== 'all') result = result.filter(l => l.tier === tierFilter);
    if (campaignFilter !== 'all') result = result.filter(l => l.lastAction.campaignId === campaignFilter);
    return result;
  }, [allLeads, tierFilter, campaignFilter]);

  const needingAssignment = allLeads.filter(l => !l.contact.assignedRep).length;
  const appointmentCount = allLeads.filter(l => l.lastAction.type === 'appointment_scheduled').length;

  if (loading || !isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <SkeletonCard key={i} variant="stat" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} variant="row" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Warm Leads</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Contacts who responded to your campaigns, sorted by priority
        </p>
      </div>

      {/* Alert Banner for unassigned high-priority leads */}
      {needingAssignment > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">
              {needingAssignment} warm lead{needingAssignment !== 1 ? 's' : ''} need{needingAssignment === 1 ? 's' : ''} assignment
            </p>
            <p className="text-xs text-red-700">Assign a rep to follow up with these high-priority contacts before they go cold.</p>
          </div>
        </div>
      )}

      {/* Stat Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-5" style={{ borderLeftWidth: '4px', borderLeftColor: '#6366f1' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{allLeads.length}</p>
              <p className="text-xs text-neutral-500">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5" style={{ borderLeftWidth: '4px', borderLeftColor: '#dc2626' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{needingAssignment}</p>
              <p className="text-xs text-neutral-500">Needing Assignment</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5" style={{ borderLeftWidth: '4px', borderLeftColor: '#059669' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{appointmentCount}</p>
              <p className="text-xs text-neutral-500">Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-neutral-100 p-1 rounded-xl inline-flex gap-1">
          {(['all', 'replied', 'info_requested', 'engaged'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                tierFilter === tier
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
            >
              {tier === 'replied' && <Flame className="w-3 h-3" />}
              {tier === 'info_requested' && <CalendarDays className="w-3 h-3" />}
              {tier === 'engaged' && <Zap className="w-3 h-3" />}
              {tier === 'all'
                ? `All (${allLeads.length})`
                : `${TIER_META[tier].label} (${allLeads.filter(l => l.tier === tier).length})`
              }
            </button>
          ))}
        </div>

        <select
          value={campaignFilter}
          onChange={e => setCampaignFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Unified Priority-Sorted List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(lead => {
            const meta = TIER_META[lead.tier];
            return (
              <div key={lead.contact.id} className="relative">
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full" style={{ backgroundColor: meta.color }} />
                <div className="pl-4">
                  <ActionCard lead={lead} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 mb-1">All caught up!</h3>
          <p className="text-sm text-neutral-500">No warm leads matching your filters. Your campaigns are running &mdash; check back soon.</p>
        </div>
      )}
    </div>
  );
}
