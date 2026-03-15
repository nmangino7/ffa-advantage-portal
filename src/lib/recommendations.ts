import type { Contact, Campaign, Activity, ServiceLine } from './types';
import { SERVICE_LINES, SERVICE_LINE_CONFIG } from './types';

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function generateRecommendations(
  contacts: Contact[],
  campaigns: Campaign[],
  activities: Activity[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = Date.now();
  const msPerDay = 86400000;

  // Rule 1: Recent replies without advisor (HIGH)
  const recentReplies = activities.filter(
    (a) => a.type === 'reply_received' && now - new Date(a.timestamp).getTime() < 2 * msPerDay
  );
  const replyContactIds = new Set(recentReplies.map((a) => a.contactId));
  const unassignedRepliers = contacts.filter(
    (c) => replyContactIds.has(c.id) && !c.assignedRep
  );
  if (unassignedRepliers.length > 0) {
    recommendations.push({
      id: 'unassigned-replies',
      priority: 'high',
      icon: 'flame',
      title: `${unassignedRepliers.length} recent ${unassignedRepliers.length === 1 ? 'reply' : 'replies'} without an advisor`,
      description: `${unassignedRepliers.length} ${unassignedRepliers.length === 1 ? 'contact has' : 'contacts have'} replied in the last 48 hours but ${unassignedRepliers.length === 1 ? 'has' : 'have'} no assigned advisor.`,
      actionLabel: 'Assign Now',
      actionHref: '/warm-leads',
    });
  }

  // Rule 2: Intent-ready contacts (HIGH)
  const intentReady = contacts.filter((c) => {
    if (c.stage !== 'education' || c.intentScore < 40) return false;
    const contactActivities = activities.filter(
      (a) => a.contactId === c.id && (a.type === 'email_opened' || a.type === 'email_clicked')
    );
    return contactActivities.length >= 2;
  });
  if (intentReady.length > 0) {
    const first = intentReady[0];
    recommendations.push({
      id: 'intent-ready',
      priority: 'high',
      icon: 'trending-up',
      title: intentReady.length === 1
        ? `${first.firstName} ${first.lastName} is ready to advance`
        : `${intentReady.length} contacts ready to advance`,
      description: intentReady.length === 1
        ? `${first.firstName} has an intent score of ${first.intentScore} with multiple email engagements — consider moving to Intent stage.`
        : `${intentReady.length} contacts in Education stage have high intent scores and multiple engagements.`,
      actionLabel: 'View Contact',
      actionHref: intentReady.length === 1 ? `/audience/${first.id}` : '/audience',
    });
  }

  // Rule 3: Dormant not enrolled (MEDIUM)
  const dormantNotEnrolled = contacts.filter(
    (c) => c.stage === 'dormant' && c.campaigns.length === 0
  );
  if (dormantNotEnrolled.length > 0) {
    recommendations.push({
      id: 'dormant-not-enrolled',
      priority: 'medium',
      icon: 'users',
      title: `${dormantNotEnrolled.length} dormant contacts not in any campaign`,
      description: `These contacts haven't been enrolled in any campaign yet — adding them could re-engage them.`,
      actionLabel: 'View Contacts',
      actionHref: '/audience',
    });
  }

  // Rule 4: High-performing campaign replication (MEDIUM)
  const highPerformers = campaigns.filter((c) => c.openRate > 40 && c.status === 'active');
  if (highPerformers.length > 0) {
    const best = highPerformers.sort((a, b) => b.openRate - a.openRate)[0];
    const serviceLinesCovered = new Set(campaigns.filter((c) => c.status === 'active').map((c) => c.serviceLine));
    const uncoveredLines = SERVICE_LINES.filter((sl) => !serviceLinesCovered.has(sl));
    if (uncoveredLines.length > 0) {
      recommendations.push({
        id: 'replicate-campaign',
        priority: 'medium',
        icon: 'rocket',
        title: `Replicate ${SERVICE_LINE_CONFIG[best.serviceLine].short} success`,
        description: `"${best.name}" has a ${best.openRate}% open rate. ${uncoveredLines[0]} has no active campaign — consider replicating this approach.`,
        actionLabel: 'Create Campaign',
        actionHref: '/campaigns/new',
      });
    }
  }

  // Rule 5: Stale qualified contacts (MEDIUM)
  const staleQualified = contacts.filter((c) => {
    if (c.stage !== 'qualified') return false;
    const daysSince = Math.floor((now - new Date(c.lastContactDate).getTime()) / msPerDay);
    return daysSince > 30;
  });
  if (staleQualified.length > 0) {
    recommendations.push({
      id: 'stale-qualified',
      priority: 'medium',
      icon: 'clock',
      title: `${staleQualified.length} qualified contacts going cold`,
      description: `These qualified contacts haven't been contacted in over 30 days — they may lose interest.`,
      actionLabel: 'View Pipeline',
      actionHref: '/pipeline',
    });
  }

  // Rule 6: Service line coverage gap (LOW)
  const activeCampaignLines = new Set(
    campaigns.filter((c) => c.status === 'active').map((c) => c.serviceLine)
  );
  const gapLines = SERVICE_LINES.filter((sl) => !activeCampaignLines.has(sl));
  if (gapLines.length > 0) {
    recommendations.push({
      id: 'service-gap',
      priority: 'low',
      icon: 'alert-triangle',
      title: `${gapLines[0]} has no active campaign`,
      description: `Consider creating a campaign for this service line to maintain coverage across all offerings.`,
      actionLabel: 'Create Campaign',
      actionHref: '/campaigns/new',
    });
  }

  // Rule 7: Unengaged campaign contacts (LOW)
  const activeCampaignIds = new Set(campaigns.filter((c) => c.status === 'active').map((c) => c.id));
  const enrolledContactIds = new Set(
    activities
      .filter((a) => a.type === 'campaign_enrolled' && a.campaignId && activeCampaignIds.has(a.campaignId))
      .map((a) => a.contactId)
  );
  const recentEngagers = new Set(
    activities
      .filter(
        (a) =>
          enrolledContactIds.has(a.contactId) &&
          a.type !== 'campaign_enrolled' &&
          a.type !== 'email_sent' &&
          now - new Date(a.timestamp).getTime() < 14 * msPerDay
      )
      .map((a) => a.contactId)
  );
  const unengaged = [...enrolledContactIds].filter((id) => !recentEngagers.has(id));
  if (unengaged.length > 5) {
    recommendations.push({
      id: 'unengaged',
      priority: 'low',
      icon: 'inbox',
      title: `${unengaged.length} enrolled contacts showing no engagement`,
      description: `These contacts are in active campaigns but haven't engaged in the last 14 days.`,
      actionLabel: 'Review Contacts',
      actionHref: '/audience',
    });
  }

  // Sort by priority and limit to 5
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
}
