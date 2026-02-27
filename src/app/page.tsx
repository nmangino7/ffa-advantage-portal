'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePortal } from '@/lib/context/PortalContext';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import type { WarmLead, WarmLeadTier } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { DripTimeline } from '@/components/ui/DripTimeline';
import { Icon } from '@/components/ui/Icon';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Users, Mail, Flame, CalendarDays, CheckCircle } from 'lucide-react';

/* ── Animated number counter ── */
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const stepTime = Math.max(Math.floor(duration / end), 12);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / stepTime));
      if (start >= end) { start = end; clearInterval(timer); }
      setDisplay(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

const HOW_IT_WORKS = [
  {
    number: 1,
    title: 'Segment Your Audience',
    description: 'Organize your dormant contacts by service line interest.',
    href: '/audience',
    iconName: 'users',
    color: '#2563eb',
  },
  {
    number: 2,
    title: 'Pick Email Templates',
    description: 'Browse 20 ready-to-send templates across 5 service lines.',
    href: '/content',
    iconName: 'mail',
    color: '#7c3aed',
  },
  {
    number: 3,
    title: 'Launch Drip Campaigns',
    description: 'Enroll contacts in automated 4-email sequences.',
    href: '/campaigns',
    iconName: 'rocket',
    color: '#059669',
  },
  {
    number: 4,
    title: 'Engage Warm Leads',
    description: 'When contacts respond, advisors step in personally.',
    href: '/warm-leads',
    iconName: 'handshake',
    color: '#d97706',
  },
];

export default function HomePage() {
  const { contacts, campaigns, activities } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-[1100px] animate-fade-in">
        {/* Hero skeleton */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl shadow-lg p-8 mb-8 h-32 animate-shimmer" />
        {/* How it works skeletons */}
        <div className="mb-8">
          <div className="h-5 w-32 rounded animate-shimmer mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="card" />)}
          </div>
        </div>
        {/* Stats skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="stat" />)}
        </div>
        {/* Action rows */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} variant="row" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden animate-fade-in animate-gradient">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-blue-500/25">
            FFA
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome to The Advantage</h1>
            <p className="text-blue-200 text-[15px] leading-relaxed max-w-xl">
              Your automated outreach platform for re-engaging dormant contacts. Follow these 4 steps to turn old leads into new opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works — 4 Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <Link key={step.number} href={step.href}
              className={`group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-lg transition-all relative overflow-hidden animate-slide-up stagger-${i + 1}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm"
                  style={{ backgroundColor: step.color }}>
                  {step.number}
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: step.color + '15' }}>
                  <Icon name={step.iconName} className="w-4 h-4" style={{ color: step.color }} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              <div className="mt-3 text-xs font-semibold group-hover:translate-x-1 transition-transform"
                style={{ color: step.color }}>
                Get started &rarr;
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up stagger-5">
        <StatCard value={<AnimatedNumber value={stats.totalContacts} />} label="Total Contacts" icon={<Users className="w-5 h-5" />} accentColor="#3b82f6" />
        <StatCard value={<AnimatedNumber value={stats.activeCampaigns} />} label="Active Campaigns" icon={<Mail className="w-5 h-5" />} accentColor="#7c3aed" />
        <StatCard
          value={<AnimatedNumber value={stats.warmLeadsNeedingAttention} />}
          label="Warm Leads Waiting"
          icon={<Flame className="w-5 h-5" />}
          accentColor={stats.warmLeadsNeedingAttention > 0 ? '#dc2626' : '#94a3b8'}
        />
        <StatCard value={<AnimatedNumber value={stats.appointmentsScheduled} />} label="Appointments Booked" icon={<CalendarDays className="w-5 h-5" />} accentColor="#059669" />
      </div>

      {/* Action Required or All Caught Up */}
      <div className="mb-8 animate-fade-in">
        {unassignedLeads.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-t-4 border-amber-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Action Required</h2>
                  <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-600 rounded-full">
                    {unassignedLeads.length} leads waiting
                  </span>
                </div>
                <Link href="/warm-leads" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  View all warm leads &rarr;
                </Link>
              </div>
              <p className="text-sm text-slate-500 mb-4">These contacts responded to your campaigns and need an advisor assigned.</p>
              <div className="space-y-3">
                {unassignedLeads.slice(0, 5).map(lead => (
                  <ActionCard key={lead.contact.id} lead={lead} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No warm leads need attention right now. New leads will appear here when contacts engage with your campaigns.
            </p>
          </div>
        )}
      </div>

      {/* Active Campaigns */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Active Campaigns</h2>
          <Link href="/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            View all campaigns &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.filter(c => c.status === 'active').map(campaign => {
            const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cfg.bgColor }}>
                    <Icon name={cfg.icon} className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{campaign.name}</h3>
                    <p className="text-[10px] text-slate-400">{campaign.enrolledCount} enrolled</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">ACTIVE</span>
                </div>

                <DripTimeline steps={campaign.emailSequence} color={cfg.color} compact />

                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>{campaign.openRate}% open</span>
                  <span>{campaign.clickRate}% click</span>
                  <span className="text-amber-600 font-semibold">{campaign.intentSignals} intent signals</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center animate-fade-in">
        <p className="text-sm font-semibold text-blue-900 mb-1">New to the platform?</p>
        <p className="text-sm text-blue-700 mb-3">Check out the step-by-step guide to learn how everything works.</p>
        <Link href="/guide" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          Read the Guide
        </Link>
      </div>
    </div>
  );
}
