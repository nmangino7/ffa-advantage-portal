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
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 mb-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS02LTJ2MmgtMnYtMmgyem0yIDBoMnYyaC0ydi0yem0yLTRoMnYyaC0ydi0yem0wLTR2MmgtMnYtMmgyek0yNiAyNnYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(167,139,250,0.4) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(99,102,241,0.3) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 6s ease infinite',
        }} />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="text-shimmer" style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(90deg, #fff 40%, #c7d2fe 50%, #fff 60%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', animation: 'textShimmer 3s linear infinite' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Nick
            </span>
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-xl">
            {unassignedLeads.length > 0
              ? `You have ${unassignedLeads.length} warm lead${unassignedLeads.length === 1 ? '' : 's'} needing attention and ${campaigns.filter(c => c.status === 'active').length} active campaigns running.`
              : `All ${campaigns.filter(c => c.status === 'active').length} campaigns running smoothly. ${contacts.length} contacts in your pipeline.`
            }
          </p>
          {/* Quick action pills */}
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="/compose" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Generate Email
            </a>
            <a href="/pipeline" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              View Pipeline
            </a>
            <a href="/warm-leads" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
              Check Warm Leads
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-1 animate-fade-up">
        <StatCard value={stats.totalContacts.toLocaleString()} label="Total Contacts" trend="+12.3%" />
        <StatCard value={stats.activeCampaigns} label="Active Campaigns" trend="+2" />
        <StatCard
          value={stats.warmLeadsNeedingAttention}
          label="Warm Leads"
          accentColor={stats.warmLeadsNeedingAttention > 0 ? '#ef4444' : undefined}
          trend={stats.warmLeadsNeedingAttention > 0 ? `+${stats.warmLeadsNeedingAttention}` : undefined}
        />
        <StatCard value={stats.appointmentsScheduled} label="Meetings Booked" trend="+5.2%" />
      </div>

      {/* AI Recommendations */}
      <div className="mb-8 stagger-2 animate-fade-up">
        <RecommendationsPanel />
      </div>

      {/* Two-column: Needs Attention + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 stagger-3 animate-fade-up">
        {/* Needs Attention — 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 section-divider">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              Needs Attention
            </h2>
            {unassignedLeads.length > 0 && (
              <Link href="/warm-leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                View all &rarr;
              </Link>
            )}
          </div>
          {unassignedLeads.length > 0 ? (
            <div className="space-y-3">
              {unassignedLeads.slice(0, 5).map((lead, index) => (
                <div key={lead.contact.id} className="gradient-border-animated" style={{ animationDelay: `${index * 0.05}s` }}>
                  <ActionCard lead={lead} />
                </div>
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
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 section-divider">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            Recent Activity
          </h2>
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Gradient header strip */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentActivities.map((act, index) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 px-4 py-3 hover:bg-neutral-50 transition-colors"
                    style={{
                      animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
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
      <div className="stagger-4 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 section-divider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            Active Campaigns
          </h2>
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
                  className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-all duration-200 min-w-[260px] shrink-0 overflow-hidden card-hover-premium"
                  style={{ borderTopWidth: '3px', borderTopColor: cfg.color }}>
                  {/* Gradient top border overlay */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{
                    background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88, ${cfg.color})`,
                  }} />
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bgColor }}>
                      <Icon name={cfg.icon} className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-neutral-900 truncate">{campaign.name}</h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse-dot" />
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
