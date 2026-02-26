export type PipelineStage = 'dormant' | 'education' | 'intent' | 'qualified' | 'licensed_rep';

export type ServiceLine =
  | 'Insurance Review'
  | 'Under-Serviced Annuities'
  | 'Retirement Planning'
  | 'Investment Planning'
  | 'Second-Opinion Positioning';

export type ActivityType =
  | 'email_sent'
  | 'email_opened'
  | 'email_clicked'
  | 'reply_received'
  | 'info_requested'
  | 'appointment_scheduled'
  | 'stage_changed'
  | 'campaign_enrolled'
  | 'call_completed'
  | 'note_added';

export type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed';

export type WarmLeadTier = 'replied' | 'info_requested' | 'engaged';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  lastContactDate: string;
  stage: PipelineStage;
  intentScore: number;
  campaigns: string[];
  assignedRep: string | null;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  contactId: string;
  contactName: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  campaignId?: string;
  campaignName?: string;
  emailSubject?: string;
  emailBody?: string;
}

export interface EmailStep {
  id: string;
  subject: string;
  previewText: string;
  body: string;
  sendDay: number;
  status: 'draft' | 'active';
}

export interface Campaign {
  id: string;
  name: string;
  serviceLine: ServiceLine;
  description: string;
  status: CampaignStatus;
  emailSequence: EmailStep[];
  enrolledCount: number;
  openRate: number;
  clickRate: number;
  intentSignals: number;
  createdAt: string;
}

export interface PipelineStageMeta {
  key: PipelineStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface WarmLead {
  contact: Contact;
  tier: WarmLeadTier;
  lastAction: Activity;
  campaignName: string;
  daysSinceAction: number;
}

export interface ContentTemplate {
  template: EmailStep;
  campaignId: string;
  campaignName: string;
  serviceLine: ServiceLine;
  stepNumber: number;
}

export interface AudienceSegment {
  stage: PipelineStageMeta;
  count: number;
  avgIntent: number;
  unassignedCount: number;
  notInCampaignCount: number;
}

export const PIPELINE_STAGES: PipelineStageMeta[] = [
  { key: 'dormant', label: 'Dormant', description: 'Not yet re-engaged', color: '#64748b', bgColor: '#f1f5f9', icon: '💤' },
  { key: 'education', label: 'Education', description: 'Receiving campaign emails', color: '#2563eb', bgColor: '#eff6ff', icon: '📧' },
  { key: 'intent', label: 'Intent Signal', description: 'Opened, clicked, or replied', color: '#d97706', bgColor: '#fffbeb', icon: '🔥' },
  { key: 'qualified', label: 'Qualified', description: 'Service associate approved', color: '#7c3aed', bgColor: '#f5f3ff', icon: '✅' },
  { key: 'licensed_rep', label: 'Licensed Rep', description: 'Meeting booked', color: '#059669', bgColor: '#ecfdf5', icon: '🤝' },
];

export const SERVICE_LINES: ServiceLine[] = [
  'Insurance Review',
  'Under-Serviced Annuities',
  'Retirement Planning',
  'Investment Planning',
  'Second-Opinion Positioning',
];

export const SERVICE_LINE_CONFIG: Record<ServiceLine, { color: string; bgColor: string; icon: string; short: string }> = {
  'Insurance Review': { color: '#2563eb', bgColor: '#eff6ff', icon: '🛡️', short: 'Insurance' },
  'Under-Serviced Annuities': { color: '#7c3aed', bgColor: '#f5f3ff', icon: '📊', short: 'Annuities' },
  'Retirement Planning': { color: '#059669', bgColor: '#ecfdf5', icon: '🏖️', short: 'Retirement' },
  'Investment Planning': { color: '#d97706', bgColor: '#fffbeb', icon: '📈', short: 'Investment' },
  'Second-Opinion Positioning': { color: '#dc2626', bgColor: '#fef2f2', icon: '🔍', short: 'Second Opinion' },
};
