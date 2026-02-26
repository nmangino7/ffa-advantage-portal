import Link from 'next/link';
import { getQuickStats, getWarmLeads, getCampaigns } from '@/lib/data';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { DripTimeline } from '@/components/ui/DripTimeline';

const HOW_IT_WORKS = [
  {
    number: 1,
    title: 'Segment Your Audience',
    description: 'Organize your dormant contacts by service line interest.',
    href: '/audience',
    icon: '👥',
    color: '#2563eb',
  },
  {
    number: 2,
    title: 'Pick Email Templates',
    description: 'Browse 20 ready-to-send templates across 5 service lines.',
    href: '/content',
    icon: '📧',
    color: '#7c3aed',
  },
  {
    number: 3,
    title: 'Launch Drip Campaigns',
    description: 'Enroll contacts in automated 4-email sequences.',
    href: '/campaigns',
    icon: '🚀',
    color: '#059669',
  },
  {
    number: 4,
    title: 'Engage Warm Leads',
    description: 'When contacts respond, advisors step in personally.',
    href: '/warm-leads',
    icon: '🤝',
    color: '#d97706',
  },
];

export default function HomePage() {
  const stats = getQuickStats();
  const warmLeads = getWarmLeads();
  const unassignedLeads = warmLeads.filter(l => !l.contact.assignedRep);
  const campaigns = getCampaigns();

  return (
    <div className="max-w-[1100px]">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
            FFA
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome to The Advantage</h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
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
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: step.color }}>
                  {step.number}
                </div>
                <span className="text-xl">{step.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              <div className="mt-3 text-xs font-semibold group-hover:translate-x-1 transition-transform"
                style={{ color: step.color }}>
                Get started →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard value={stats.totalContacts.toLocaleString()} label="Total Contacts" icon="👥" />
        <StatCard value={stats.activeCampaigns} label="Active Campaigns" icon="📧" />
        <StatCard
          value={stats.warmLeadsNeedingAttention}
          label="Warm Leads Waiting"
          icon="🔥"
          accentColor={stats.warmLeadsNeedingAttention > 0 ? '#dc2626' : undefined}
        />
        <StatCard value={stats.appointmentsScheduled} label="Appointments Booked" icon="📅" accentColor="#059669" />
      </div>

      {/* Action Required */}
      {unassignedLeads.length > 0 && (
        <div className="mb-8">
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
                  View all warm leads →
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
        </div>
      )}

      {/* Active Campaigns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Active Campaigns</h2>
          <Link href="/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            View all campaigns →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.filter(c => c.status === 'active').map(campaign => {
            const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
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
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center">
        <p className="text-sm font-semibold text-blue-900 mb-1">New to the platform?</p>
        <p className="text-sm text-blue-700 mb-3">Check out the step-by-step guide to learn how everything works.</p>
        <Link href="/guide" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          Read the Guide
        </Link>
      </div>
    </div>
  );
}
