'use client';

import { useState, useMemo } from 'react';
import { getCampaigns, getCampaignDetailedMetrics } from '@/lib/data';
import { SERVICE_LINE_CONFIG, type CampaignStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DripTimeline } from '@/components/ui/DripTimeline';
import Link from 'next/link';

export default function CampaignsPage() {
  const campaigns = getCampaigns();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return campaigns;
    return campaigns.filter(c => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const statusCounts = {
    all: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your automated drip email campaigns"
        action={
          <Link href="/content"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Campaign
          </Link>
        }
      />

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'paused', 'draft'] as const).map(status => (
          <button key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div className="space-y-5">
        {filtered.map(campaign => {
          const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
          const metrics = getCampaignDetailedMetrics(campaign.id);

          return (
            <div key={campaign.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-1" style={{ backgroundColor: cfg.color }} />
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                        : campaign.status === 'draft' ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-700'
                      }`}>{campaign.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">{campaign.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      {campaign.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <Link href={`/campaigns/${campaign.id}`}
                      className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Drip Timeline */}
                <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-3">
                    {campaign.emailSequence.length}-Email Drip Sequence &bull; Over {campaign.emailSequence[campaign.emailSequence.length - 1]?.sendDay} Days
                  </p>
                  <DripTimeline steps={campaign.emailSequence} color={cfg.color} />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 flex-wrap">
                  <MetricPill label="Enrolled" value={campaign.enrolledCount} />
                  <MetricPill label="Sent" value={metrics.sent} />
                  <MetricPill label="Opened" value={metrics.opened} sub={`${metrics.sent > 0 ? Math.round(metrics.opened / metrics.sent * 100) : 0}%`} />
                  <MetricPill label="Clicked" value={metrics.clicked} sub={`${metrics.sent > 0 ? Math.round(metrics.clicked / metrics.sent * 100) : 0}%`} />
                  <MetricPill label="Replied" value={metrics.replied} highlight />
                  <MetricPill label="Info Req" value={metrics.requested} highlight />
                  <MetricPill label="Appointments" value={metrics.booked} highlight />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricPill({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <span className="text-[9px] text-slate-400">{sub}</span>}
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
