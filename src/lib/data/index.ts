import { contacts, campaigns, activities } from './mock-data';
import type { Contact, Campaign, Activity, PipelineStage, WarmLead, WarmLeadTier, ContentTemplate, AudienceSegment } from '../types';
import { PIPELINE_STAGES } from '../types';

// ─── Contact Functions ───────────────────────────────────────

export function getContacts(filters?: {
  stage?: PipelineStage;
  campaignId?: string;
  search?: string;
}): Contact[] {
  let result = [...contacts];
  if (filters?.stage) result = result.filter(c => c.stage === filters.stage);
  if (filters?.campaignId) result = result.filter(c => c.campaigns.includes(filters.campaignId!));
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  }
  return result;
}

export function getContact(id: string): Contact | undefined {
  return contacts.find(c => c.id === id);
}

export function getHotLeads(limit = 10): Contact[] {
  return [...contacts]
    .filter(c => c.intentScore >= 30)
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, limit);
}

export function getDormantContacts(): Contact[] {
  return contacts
    .filter(c => c.stage === 'dormant')
    .sort((a, b) => new Date(a.lastContactDate).getTime() - new Date(b.lastContactDate).getTime());
}

// ─── Campaign Functions ──────────────────────────────────────

export function getCampaigns(): Campaign[] {
  return [...campaigns];
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find(c => c.id === id);
}

export function getContactsByCampaign(campaignId: string): Contact[] {
  return contacts.filter(c => c.campaigns.includes(campaignId));
}

export function getCampaignDetailedMetrics(campaignId: string) {
  const campActivities = activities.filter(a => a.campaignId === campaignId);
  const campContacts = contacts.filter(c => c.campaigns.includes(campaignId));

  const sent = campActivities.filter(a => a.type === 'email_sent').length;
  const opened = campActivities.filter(a => a.type === 'email_opened').length;
  const clicked = campActivities.filter(a => a.type === 'email_clicked').length;
  const replied = campActivities.filter(a => a.type === 'reply_received').length;
  const requested = campActivities.filter(a => a.type === 'info_requested').length;
  const booked = campActivities.filter(a => a.type === 'appointment_scheduled').length;

  const stageBreakdown: Record<PipelineStage, number> = { dormant: 0, education: 0, intent: 0, qualified: 0, licensed_rep: 0 };
  campContacts.forEach(c => stageBreakdown[c.stage]++);

  const avgIntent = campContacts.length > 0
    ? Math.round(campContacts.reduce((s, c) => s + c.intentScore, 0) / campContacts.length)
    : 0;

  return { sent, opened, clicked, replied, requested, booked, stageBreakdown, avgIntent, totalContacts: campContacts.length };
}

// ─── Activity Functions ──────────────────────────────────────

export function getActivities(limit?: number, contactId?: string): Activity[] {
  let result = [...activities];
  if (contactId) result = result.filter(a => a.contactId === contactId);
  if (limit) result = result.slice(0, limit);
  return result;
}

export function getContactEngagement(contactId: string) {
  const contactActivities = activities.filter(a => a.contactId === contactId);
  return {
    totalActions: contactActivities.length,
    emailsSent: contactActivities.filter(a => a.type === 'email_sent').length,
    emailsOpened: contactActivities.filter(a => a.type === 'email_opened').length,
    emailsClicked: contactActivities.filter(a => a.type === 'email_clicked').length,
    replies: contactActivities.filter(a => a.type === 'reply_received').length,
    infoRequests: contactActivities.filter(a => a.type === 'info_requested').length,
    appointments: contactActivities.filter(a => a.type === 'appointment_scheduled').length,
    lastActivity: contactActivities.length > 0 ? contactActivities[0].timestamp : null,
  };
}

export function getContactLastActivity(contactId: string): Activity | null {
  return activities.find(a => a.contactId === contactId) || null;
}

// ─── Pipeline Functions ──────────────────────────────────────

export function getPipelineStats(): Record<PipelineStage, number> {
  const stats: Record<PipelineStage, number> = { dormant: 0, education: 0, intent: 0, qualified: 0, licensed_rep: 0 };
  for (const c of contacts) stats[c.stage]++;
  return stats;
}

export function getEmailsSentCount(): number {
  return activities.filter(a => a.type === 'email_sent').length;
}

export function getEngagementRate(): number {
  const sent = activities.filter(a => a.type === 'email_sent').length;
  const engaged = activities.filter(a => ['email_opened', 'email_clicked', 'reply_received', 'info_requested'].includes(a.type)).length;
  return sent > 0 ? Math.round((engaged / sent) * 100) : 0;
}

export function getActivityBreakdown() {
  const counts: Record<string, number> = {};
  for (const a of activities) {
    counts[a.type] = (counts[a.type] || 0) + 1;
  }
  return {
    emailsSent: counts['email_sent'] || 0,
    emailsOpened: counts['email_opened'] || 0,
    emailsClicked: counts['email_clicked'] || 0,
    repliesReceived: counts['reply_received'] || 0,
    infoRequested: counts['info_requested'] || 0,
    appointmentsBooked: counts['appointment_scheduled'] || 0,
    campaignEnrollments: counts['campaign_enrolled'] || 0,
  };
}

export function getWeeklyOutreach() {
  return [
    { week: '4 wks ago', sent: 142, opened: 48, clicked: 18, replies: 5 },
    { week: '3 wks ago', sent: 168, opened: 61, clicked: 24, replies: 8 },
    { week: '2 wks ago', sent: 195, opened: 74, clicked: 31, replies: 11 },
    { week: 'Last week', sent: 221, opened: 89, clicked: 38, replies: 14 },
  ];
}

// ─── Warm Leads (NEW) ───────────────────────────────────────

export function getWarmLeads(): WarmLead[] {
  const highValueTypes: Record<string, WarmLeadTier> = {
    'reply_received': 'replied',
    'info_requested': 'info_requested',
    'appointment_scheduled': 'replied',
  };

  const leadMap = new Map<string, WarmLead>();

  // First pass: find contacts with high-value activities
  for (const act of activities) {
    const tier = highValueTypes[act.type];
    if (!tier) continue;

    const contact = contacts.find(c => c.id === act.contactId);
    if (!contact) continue;

    const existing = leadMap.get(contact.id);
    const tierPriority: Record<WarmLeadTier, number> = { replied: 1, info_requested: 2, engaged: 3 };

    if (!existing || tierPriority[tier] < tierPriority[existing.tier]) {
      const daysSinceAction = Math.floor((Date.now() - new Date(act.timestamp).getTime()) / 86400000);
      leadMap.set(contact.id, {
        contact,
        tier,
        lastAction: act,
        campaignName: act.campaignName || 'Direct',
        daysSinceAction,
      });
    }
  }

  // Second pass: contacts with clicks and high intent but no reply/request
  for (const act of activities) {
    if (act.type !== 'email_clicked') continue;
    const contact = contacts.find(c => c.id === act.contactId);
    if (!contact || contact.intentScore < 30) continue;
    if (leadMap.has(contact.id)) continue;

    const daysSinceAction = Math.floor((Date.now() - new Date(act.timestamp).getTime()) / 86400000);
    leadMap.set(contact.id, {
      contact,
      tier: 'engaged',
      lastAction: act,
      campaignName: act.campaignName || 'Direct',
      daysSinceAction,
    });
  }

  // Sort: by tier priority then by most recent
  const tierOrder: Record<WarmLeadTier, number> = { replied: 0, info_requested: 1, engaged: 2 };
  return Array.from(leadMap.values()).sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.daysSinceAction - b.daysSinceAction;
  });
}

export function getWarmLeadsSummary(): number {
  return getWarmLeads().filter(wl => !wl.contact.assignedRep).length;
}

// ─── Content Library (NEW) ───────────────────────────────────

export function getContentLibrary(): ContentTemplate[] {
  const templates: ContentTemplate[] = [];
  for (const campaign of campaigns) {
    for (let i = 0; i < campaign.emailSequence.length; i++) {
      templates.push({
        template: campaign.emailSequence[i],
        campaignId: campaign.id,
        campaignName: campaign.name,
        serviceLine: campaign.serviceLine,
        stepNumber: i + 1,
      });
    }
  }
  return templates;
}

// ─── Audience Segments (NEW) ─────────────────────────────────

export function getAudienceSegments(): AudienceSegment[] {
  return PIPELINE_STAGES.map(stage => {
    const stageContacts = contacts.filter(c => c.stage === stage.key);
    const avgIntent = stageContacts.length > 0
      ? Math.round(stageContacts.reduce((s, c) => s + c.intentScore, 0) / stageContacts.length)
      : 0;
    const unassignedCount = stageContacts.filter(c => !c.assignedRep).length;
    const notInCampaignCount = stageContacts.filter(c => c.campaigns.length === 0).length;

    return { stage, count: stageContacts.length, avgIntent, unassignedCount, notInCampaignCount };
  });
}

// ─── Quick Stats (NEW) ───────────────────────────────────────

export function getQuickStats() {
  const warmLeadsNeedingAttention = getWarmLeadsSummary();
  const appointmentsScheduled = activities.filter(a => a.type === 'appointment_scheduled').length;

  return {
    totalContacts: contacts.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    warmLeadsNeedingAttention,
    appointmentsScheduled,
  };
}

// ─── Dashboard (kept for backward compat) ────────────────────

export function getDashboardMetrics() {
  const stats = getPipelineStats();
  const breakdown = getActivityBreakdown();
  const recentIntentSignals = activities.filter(a => {
    const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / 86400000;
    return daysAgo <= 7 && ['email_clicked', 'reply_received', 'info_requested'].includes(a.type);
  }).length;

  return {
    totalContacts: contacts.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    recentIntentSignals,
    appointmentsScheduled: breakdown.appointmentsBooked,
    pipelineStats: stats,
    emailsSent: breakdown.emailsSent,
    emailsOpened: breakdown.emailsOpened,
    emailsClicked: breakdown.emailsClicked,
    repliesReceived: breakdown.repliesReceived,
    engagementRate: getEngagementRate(),
    dormantOver1Year: contacts.filter(c => {
      const daysAgo = (Date.now() - new Date(c.lastContactDate).getTime()) / 86400000;
      return c.stage === 'dormant' && daysAgo > 365;
    }).length,
    totalCampaigns: campaigns.length,
  };
}
