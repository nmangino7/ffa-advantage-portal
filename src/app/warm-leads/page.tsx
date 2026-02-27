'use client';

import { useState, useMemo } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import type { WarmLead, WarmLeadTier } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ActionCard } from '@/components/ui/ActionCard';
import { StatCard } from '@/components/ui/StatCard';
import { Icon } from '@/components/ui/Icon';
import { Flame, Zap, MessageSquare, CalendarDays, Handshake, CheckCircle2 } from 'lucide-react';

const TIER_META: Record<WarmLeadTier, { label: string; description: string; color: string; bg: string }> = {
  replied: { label: 'Replied', description: 'These contacts responded directly — highest priority', color: '#dc2626', bg: '#fef2f2' },
  info_requested: { label: 'Requested Info', description: 'Asked for more information about a service', color: '#d97706', bg: '#fffbeb' },
  engaged: { label: 'Engaged', description: 'Multiple opens or clicks — showing strong interest', color: '#ca8a04', bg: '#fefce8' },
};

export default function WarmLeadsPage() {
  const { contacts, campaigns, activities } = usePortal();
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
  const repliedCount = allLeads.filter(l => l.tier === 'replied').length;
  const appointmentCount = allLeads.filter(l => l.lastAction.type === 'appointment_scheduled').length;

  const grouped = useMemo(() => {
    const tiers: WarmLeadTier[] = ['replied', 'info_requested', 'engaged'];
    return tiers.map(tier => ({
      tier,
      leads: filtered.filter(l => l.tier === tier),
    })).filter(g => g.leads.length > 0);
  }, [filtered]);

  return (
    <div className="max-w-[1000px]">
      <PageHeader
        title="Warm Leads"
        subtitle="Contacts who responded to your campaigns — ready for personal outreach"
      />

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Handshake className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">This is where automation stops and you step in.</p>
            <p className="text-sm text-blue-700">
              When your automated drip campaigns detect engagement &mdash; a reply, an info request, or repeated clicks &mdash; the contact appears here. Review their activity and assign an advisor for personal follow-up.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-blue-600">
              <span className="bg-blue-100 px-2 py-1 rounded-md font-medium">Automated Campaign</span>
              <span>&rarr;</span>
              <span className="bg-blue-100 px-2 py-1 rounded-md font-medium">Contact Responds</span>
              <span>&rarr;</span>
              <span className="bg-blue-200 px-2 py-1 rounded-md font-bold">You Are Here</span>
              <span>&rarr;</span>
              <span className="bg-blue-100 px-2 py-1 rounded-md font-medium">Advisor Takes Over</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={allLeads.length} label="Total Warm Leads" icon={<Flame className="w-5 h-5" />} accentColor="#d97706" />
        <StatCard value={needingAssignment} label="Needing Assignment" accentColor={needingAssignment > 0 ? '#dc2626' : '#94a3b8'} icon={<Zap className="w-5 h-5" />} />
        <StatCard value={repliedCount} label="Replied (Hottest)" accentColor="#dc2626" icon={<MessageSquare className="w-5 h-5" />} />
        <StatCard value={appointmentCount} label="Appointments" accentColor="#059669" icon={<CalendarDays className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1.5">
          {(['all', 'replied', 'info_requested', 'engaged'] as const).map(tier => (
            <button key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                tierFilter === tier
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {tier === 'all' ? `All (${allLeads.length})` : `${TIER_META[tier].label} (${allLeads.filter(l => l.tier === tier).length})`}
            </button>
          ))}
        </div>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Leads grouped by tier */}
      {grouped.length > 0 ? (
        <div className="space-y-8">
          {grouped.map(({ tier, leads }) => {
            const meta = TIER_META[tier];
            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  <h2 className="text-base font-bold text-slate-900">{meta.label}</h2>
                  <span className="text-xs text-slate-400">{meta.description}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.bg, color: meta.color }}>
                    {leads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {leads.map(lead => (
                    <ActionCard key={lead.contact.id} lead={lead} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-500">No warm leads matching your filters. Your campaigns are running &mdash; check back soon.</p>
        </div>
      )}
    </div>
  );
}
