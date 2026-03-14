'use client';

import { useState, useMemo } from 'react';
import { getCampaignDetailedMetrics } from '@/lib/data';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG, type CampaignStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default function CampaignsPage() {
  const { campaigns, toggleCampaignStatus, duplicateCampaign } = usePortal();
  const { showToast } = useToast();
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

  const statusDotColor: Record<string, string> = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    draft: 'bg-neutral-400',
    completed: 'bg-neutral-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your automated drip email campaigns"
        action={
          <Link href="/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </Link>
        }
      />

      {/* Filter Pills */}
      <div className="flex gap-1.5 mb-6">
        {(['all', 'active', 'paused', 'draft', 'completed'] as const).map(status => (
          <button key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === status
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:bg-neutral-50'
            }`}>
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1 opacity-60">{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Campaign</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Service Line</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Enrolled</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Open %</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Click %</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Replies</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(campaign => {
              const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
              const metrics = getCampaignDetailedMetrics(campaign.id);
              const openPct = metrics.sent > 0 ? Math.round(metrics.opened / metrics.sent * 100) : 0;
              const clickPct = metrics.sent > 0 ? Math.round(metrics.clicked / metrics.sent * 100) : 0;

              return (
                <tr key={campaign.id} className="group hover:bg-neutral-50 transition-colors">
                  {/* Name + Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColor[campaign.status] || 'bg-neutral-300'}`} />
                      <div className="min-w-0">
                        <Link href={`/campaigns/${campaign.id}`} className="text-sm font-semibold text-neutral-900 hover:text-indigo-600 transition-colors">
                          {campaign.name}
                        </Link>
                        <p className="text-xs text-neutral-500 truncate">{campaign.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Service Line Badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                      <Icon name={cfg.icon} className="w-3.5 h-3.5" />
                      {campaign.serviceLine}
                    </span>
                  </td>

                  {/* Enrolled */}
                  <td className="py-3.5 px-4 text-center text-sm text-neutral-900 font-semibold">
                    {campaign.enrolledCount}
                  </td>

                  {/* Open % */}
                  <td className="py-3.5 px-4 text-center text-sm text-neutral-900">
                    {openPct}%
                  </td>

                  {/* Click % */}
                  <td className="py-3.5 px-4 text-center text-sm text-neutral-900">
                    {clickPct}%
                  </td>

                  {/* Replies */}
                  <td className="py-3.5 px-4 text-center text-sm font-semibold text-neutral-900">
                    {metrics.replied}
                  </td>

                  {/* Actions — visible on hover */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {campaign.status === 'active' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => { duplicateCampaign(campaign.id); showToast(`"${campaign.name}" duplicated as draft`); }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Duplicate"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link href={`/campaigns/${campaign.id}/edit`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-500">No campaigns found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
