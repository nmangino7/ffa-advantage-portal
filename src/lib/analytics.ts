import type { Contact, Campaign, Activity, ServiceLine } from './types';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from './types';

export interface CampaignPerformanceData {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

export interface EngagementTrendData {
  date: string;
  engagements: number;
  opens: number;
  clicks: number;
}

export interface PipelineFunnelData {
  stage: string;
  label: string;
  count: number;
  color: string;
}

export interface ServiceLineComparisonData {
  serviceLine: string;
  short: string;
  enrolled: number;
  opened: number;
  clicked: number;
  replied: number;
}

export interface TopCampaignData {
  id: string;
  name: string;
  serviceLine: ServiceLine;
  enrolledCount: number;
  openRate: number;
  clickRate: number;
  score: number;
  sparklineData: number[];
}

export interface KeyMetrics {
  totalEngagementRate: number;
  avgOpenRate: number;
  avgClickRate: number;
  conversionRate: number;
}

export function computeCampaignPerformance(
  campaigns: Campaign[],
  activities: Activity[]
): CampaignPerformanceData[] {
  return campaigns.map((campaign) => {
    const campaignActivities = activities.filter((a) => a.campaignId === campaign.id);
    return {
      name: campaign.name.length > 20 ? campaign.name.slice(0, 18) + '…' : campaign.name,
      sent: campaignActivities.filter((a) => a.type === 'email_sent').length,
      opened: campaignActivities.filter((a) => a.type === 'email_opened').length,
      clicked: campaignActivities.filter((a) => a.type === 'email_clicked').length,
      replied: campaignActivities.filter((a) => a.type === 'reply_received').length,
    };
  });
}

export function computeEngagementTrend(
  activities: Activity[],
  days: number = 30
): EngagementTrendData[] {
  const now = Date.now();
  const msPerDay = 86400000;
  const result: EngagementTrendData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i + 1) * msPerDay;
    const dayEnd = now - i * msPerDay;
    const dayActivities = activities.filter((a) => {
      const t = new Date(a.timestamp).getTime();
      return t >= dayStart && t < dayEnd;
    });

    const date = new Date(dayStart);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    result.push({
      date: label,
      engagements: dayActivities.length,
      opens: dayActivities.filter((a) => a.type === 'email_opened').length,
      clicks: dayActivities.filter((a) => a.type === 'email_clicked').length,
    });
  }

  return result;
}

export function computePipelineFunnel(contacts: Contact[]): PipelineFunnelData[] {
  return PIPELINE_STAGES.map((stage) => ({
    stage: stage.key,
    label: stage.label,
    count: contacts.filter((c) => c.stage === stage.key).length,
    color: stage.color,
  }));
}

export function computeServiceLineComparison(
  campaigns: Campaign[],
  activities: Activity[]
): ServiceLineComparisonData[] {
  const serviceLines = Object.keys(SERVICE_LINE_CONFIG) as ServiceLine[];

  return serviceLines.map((sl) => {
    const slCampaigns = campaigns.filter((c) => c.serviceLine === sl);
    const slCampaignIds = new Set(slCampaigns.map((c) => c.id));
    const slActivities = activities.filter((a) => a.campaignId && slCampaignIds.has(a.campaignId));

    return {
      serviceLine: sl,
      short: SERVICE_LINE_CONFIG[sl].short,
      enrolled: slCampaigns.reduce((sum, c) => sum + c.enrolledCount, 0),
      opened: slActivities.filter((a) => a.type === 'email_opened').length,
      clicked: slActivities.filter((a) => a.type === 'email_clicked').length,
      replied: slActivities.filter((a) => a.type === 'reply_received').length,
    };
  });
}

export function computeTopCampaigns(
  campaigns: Campaign[],
  activities: Activity[]
): TopCampaignData[] {
  const now = Date.now();
  const msPerDay = 86400000;

  return campaigns
    .map((campaign) => {
      const score = campaign.openRate * 2 + campaign.clickRate * 3 + campaign.intentSignals;
      const campaignActivities = activities.filter((a) => a.campaignId === campaign.id);

      // Sparkline: daily engagement counts for last 14 days
      const sparklineData: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const dayStart = now - (i + 1) * msPerDay;
        const dayEnd = now - i * msPerDay;
        sparklineData.push(
          campaignActivities.filter((a) => {
            const t = new Date(a.timestamp).getTime();
            return t >= dayStart && t < dayEnd;
          }).length
        );
      }

      return {
        id: campaign.id,
        name: campaign.name,
        serviceLine: campaign.serviceLine,
        enrolledCount: campaign.enrolledCount,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        score,
        sparklineData,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function computeKeyMetrics(
  campaigns: Campaign[],
  activities: Activity[],
  contacts: Contact[]
): KeyMetrics {
  const totalSent = activities.filter((a) => a.type === 'email_sent').length;
  const totalOpens = activities.filter((a) => a.type === 'email_opened').length;
  const totalClicks = activities.filter((a) => a.type === 'email_clicked').length;
  const totalReplies = activities.filter((a) => a.type === 'reply_received').length;

  const totalEngagementRate =
    totalSent > 0 ? Math.round(((totalOpens + totalClicks + totalReplies) / totalSent) * 100) : 0;

  const activeCampaigns = campaigns.filter((c) => c.status === 'active' || c.status === 'completed');
  const avgOpenRate =
    activeCampaigns.length > 0
      ? Math.round(activeCampaigns.reduce((sum, c) => sum + c.openRate, 0) / activeCampaigns.length)
      : 0;
  const avgClickRate =
    activeCampaigns.length > 0
      ? Math.round(activeCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / activeCampaigns.length)
      : 0;

  const nonDormant = contacts.filter((c) => c.stage !== 'dormant').length;
  const qualified = contacts.filter(
    (c) => c.stage === 'qualified' || c.stage === 'licensed_rep'
  ).length;
  const conversionRate = nonDormant > 0 ? Math.round((qualified / nonDormant) * 100) : 0;

  return { totalEngagementRate, avgOpenRate, avgClickRate, conversionRate };
}
