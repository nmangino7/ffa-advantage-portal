'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePortal } from '@/lib/context/PortalContext';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import type { WarmLead, WarmLeadTier } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { Icon } from '@/components/ui/Icon';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { RecommendationsPanel } from '@/components/ui/RecommendationsPanel';
import {
  Mail, Flame, CalendarDays, CheckCircle, Clock, FileText, UserPlus, Play,
} from 'lucide-react';

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function activityIcon(type: string) {
  switch (type) {
    case 'campaign_enrolled': return <UserPlus className="w-3.5 h-3.5" />;
    case 'email_sent':
    case 'email_opened':
    case 'email_clicked': return <Mail className="w-3.5 h-3.5" />;
    case 'reply_received': return <Flame className="w-3.5 h-3.5" />;
    case 'info_requested': return <FileText className="w-3.5 h-3.5" />;
    case 'appointment_scheduled': return <CalendarDays className="w-3.5 h-3.5" />;
    case 'stage_changed': return <Play className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
}

export default function HomePage() {
  const { contacts, campaigns, activities, isHydrated } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => setLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  const warmLeads = useMemo(() => {
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

  const unassignedLeads = warmLeads.filter(l => !l.contact.assignedRep);

  const stats = useMemo(() => ({
    totalContacts: contacts.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    warmLeadsNeedingAttention: unassignedLeads.length,
    appointmentsScheduled: activities.filter(a => a.type === 'appointment_scheduled').length,
  }), [contacts, campaigns, activities, unassignedLeads]);

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [activities]);

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard value={stats.totalContacts.toLocaleString()} label="Total Contacts" />
        <StatCard value={stats.activeCampaigns} label="Active Campaigns" />
        <StatCard
          value={stats.warmLeadsNeedingAttention}
          label="Warm Leads"
          accentColor={stats.warmLeadsNeedingAttention > 0 ? '#ef4444' : undefined}
        />
        <StatCard value={stats.appointmentsScheduled} label="Meetings Booked" />
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <RecommendationsPanel />
      </div>

      {/* Two-column: Needs Attention + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Needs Attention — 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Needs Attention</h2>
            {unassignedLeads.length > 0 && (
              <Link href="/warm-leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                View all &rarr;
              </Link>
            )}
          </div>
          {unassignedLeads.length > 0 ? (
            <div className="space-y-3">
              {unassignedLeads.slice(0, 5).map(lead => (
                <ActionCard key={lead.contact.id} lead={lead} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">All caught up</h3>
              <p className="text-xs text-neutral-500">No warm leads need attention right now.</p>
            </div>
          )}
        </div>

        {/* Recent Activity — 1/3 */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentActivities.map(act => (
                  <div key={act.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-neutral-50 transition-colors">
                    <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0 mt-0.5">
                      {activityIcon(act.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-700 line-clamp-2">{act.description}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{act.contactName} &middot; {timeAgo(act.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Clock className="w-5 h-5 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">No activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Campaigns strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Active Campaigns</h2>
          <Link href="/campaigns" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            All campaigns &rarr;
          </Link>
        </div>
        {campaigns.filter(c => c.status === 'active').length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {campaigns.filter(c => c.status === 'active').map(campaign => {
              const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}
                  className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 hover:shadow-md transition-all duration-200 min-w-[260px] shrink-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bgColor }}>
                      <Icon name={cfg.icon} className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-neutral-900 truncate">{campaign.name}</h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="flex gap-4 text-[11px] text-neutral-500">
                    <span>{campaign.enrolledCount} enrolled</span>
                    <span>{campaign.openRate}% open</span>
                    <span>{campaign.clickRate}% click</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
            <Mail className="w-5 h-5 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500 mb-3">No active campaigns yet.</p>
            <Link href="/campaigns/new" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
              Create Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
