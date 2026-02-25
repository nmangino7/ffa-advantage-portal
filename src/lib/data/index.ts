import { contacts, campaigns, activities } from './mock-data';
import { Contact, Campaign, Activity, PipelineStage } from '../types';

// Data service abstraction - swap mock data for HubSpot API calls later

export function getContacts(filters?: {
  stage?: PipelineStage;
  campaignId?: string;
  search?: string;
}): Contact[] {
  let result = [...contacts];

  if (filters?.stage) {
    result = result.filter(c => c.stage === filters.stage);
  }
  if (filters?.campaignId) {
    result = result.filter(c => c.campaigns.includes(filters.campaignId!));
  }
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

export function getCampaigns(): Campaign[] {
  return [...campaigns];
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find(c => c.id === id);
}

export function getActivities(limit?: number, contactId?: string): Activity[] {
  let result = [...activities];
  if (contactId) {
    result = result.filter(a => a.contactId === contactId);
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
}

export function getContactsByCampaign(campaignId: string): Contact[] {
  return contacts.filter(c => c.campaigns.includes(campaignId));
}

export function getPipelineStats(): Record<PipelineStage, number> {
  const stats: Record<PipelineStage, number> = {
    dormant: 0,
    education: 0,
    intent: 0,
    qualified: 0,
    licensed_rep: 0,
  };
  for (const c of contacts) {
    stats[c.stage]++;
  }
  return stats;
}

export function getDashboardMetrics() {
  const stats = getPipelineStats();
  const totalContacts = contacts.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const recentIntentSignals = activities.filter(a => {
    const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / 86400000;
    return daysAgo <= 7 && ['email_clicked', 'reply_received', 'info_requested'].includes(a.type);
  }).length;
  const appointmentsScheduled = activities.filter(a => a.type === 'appointment_scheduled').length;

  return {
    totalContacts,
    activeCampaigns,
    recentIntentSignals,
    appointmentsScheduled,
    pipelineStats: stats,
  };
}
