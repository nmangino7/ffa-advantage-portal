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
}

export interface EmailStep {
  id: string;
  subject: string;
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
}

export const PIPELINE_STAGES: PipelineStageMeta[] = [
  { key: 'dormant', label: 'Dormant', description: 'Not yet engaged', color: '#94a3b8' },
  { key: 'education', label: 'Education', description: 'Enrolled in campaign', color: '#3b82f6' },
  { key: 'intent', label: 'Intent Signal', description: 'Clicked, replied, or requested', color: '#f59e0b' },
  { key: 'qualified', label: 'Qualified', description: 'Service associate approved', color: '#8b5cf6' },
  { key: 'licensed_rep', label: 'Licensed Rep', description: 'Appointment set', color: '#10b981' },
];

export const SERVICE_LINES: ServiceLine[] = [
  'Insurance Review',
  'Under-Serviced Annuities',
  'Retirement Planning',
  'Investment Planning',
  'Second-Opinion Positioning',
];
