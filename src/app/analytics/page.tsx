'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePortal } from '@/lib/context/PortalContext';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { ChartCard } from '@/components/charts/ChartCard';
import { CampaignPerformanceChart } from '@/components/charts/CampaignPerformanceChart';
import { EngagementTrendChart } from '@/components/charts/EngagementTrendChart';
import { PipelineFunnelChart } from '@/components/charts/PipelineFunnelChart';
import { ServiceLineComparisonChart } from '@/components/charts/ServiceLineComparisonChart';
import { SparklineChart } from '@/components/charts/SparklineChart';
import { Icon } from '@/components/ui/Icon';
import {
  computeCampaignPerformance,
  computeEngagementTrend,
  computePipelineFunnel,
  computeServiceLineComparison,
  computeTopCampaigns,
  computeKeyMetrics,
} from '@/lib/analytics';

export default function AnalyticsPage() {
  const { contacts, campaigns, activities, isHydrated } = usePortal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => setLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  const campaignPerformance = useMemo(
    () => computeCampaignPerformance(campaigns, activities),
    [campaigns, activities]
  );
  const engagementTrend = useMemo(
    () => computeEngagementTrend(activities),
    [activities]
  );
  const pipelineFunnel = useMemo(
    () => computePipelineFunnel(contacts),
    [contacts]
  );
  const serviceLineComparison = useMemo(
    () => computeServiceLineComparison(campaigns, activities),
    [campaigns, activities]
  );
  const topCampaigns = useMemo(
    () => computeTopCampaigns(campaigns, activities),
    [campaigns, activities]
  );
  const keyMetrics = useMemo(
    () => computeKeyMetrics(campaigns, activities, contacts),
    [campaigns, activities, contacts]
  );

  if (loading || !isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} variant="stat" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} variant="row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      <PageHeader
        title="Analytics"
        subtitle="Campaign performance and engagement insights"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          value={`${keyMetrics.totalEngagementRate}%`}
          label="Engagement Rate"
          accentColor="#6366f1"
        />
        <StatCard
          value={`${keyMetrics.avgOpenRate}%`}
          label="Avg Open Rate"
          accentColor="#2563eb"
        />
        <StatCard
          value={`${keyMetrics.avgClickRate}%`}
          label="Avg Click Rate"
          accentColor="#f59e0b"
        />
        <StatCard
          value={`${keyMetrics.conversionRate}%`}
          label="Conversion Rate"
          accentColor="#059669"
        />
      </div>

      {/* Row 1: Campaign Performance + Engagement Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Campaign Performance">
          <CampaignPerformanceChart data={campaignPerformance} />
        </ChartCard>
        <ChartCard title="Engagement Trend" subtitle="Last 30 days">
          <EngagementTrendChart data={engagementTrend} />
        </ChartCard>
      </div>

      {/* Row 2: Pipeline Funnel + Service Line Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Pipeline Funnel">
          <PipelineFunnelChart data={pipelineFunnel} />
        </ChartCard>
        <ChartCard title="Service Line Comparison">
          <ServiceLineComparisonChart data={serviceLineComparison} />
        </ChartCard>
      </div>

      {/* Row 3: Top Performing Campaigns */}
      <ChartCard title="Top Performing Campaigns">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-2 pr-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Campaign</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Service Line</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Enrolled</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Open Rate</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Click Rate</th>
                <th className="text-right py-2 pl-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-neutral-400">
                    No campaign data to display yet.
                  </td>
                </tr>
              )}
              {topCampaigns.map((campaign, idx) => {
                const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
                return (
                  <tr
                    key={campaign.id}
                    className={`border-b border-neutral-50 hover:bg-indigo-50/30 transition-all duration-200 ${idx % 2 === 1 ? 'bg-neutral-50/50' : ''}`}
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium text-neutral-900 hover:text-indigo-600 transition-colors"
                      >
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ backgroundColor: cfg.bgColor }}
                        >
                          <Icon name={cfg.icon} className="w-3 h-3" style={{ color: cfg.color }} />
                        </span>
                        {cfg.short}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-neutral-600">{campaign.enrolledCount}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-neutral-600">{campaign.openRate}%</td>
                    <td className="py-3 px-4 text-right tabular-nums text-neutral-600">{campaign.clickRate}%</td>
                    <td className="py-3 pl-4 text-right">
                      <SparklineChart data={campaign.sparklineData} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
