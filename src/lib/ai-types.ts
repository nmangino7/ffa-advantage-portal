import type { ServiceLine } from './types';

export type AITone = 'professional' | 'conversational' | 'educational';
export type AIContentType = 'email' | 'newsletter' | 'document';

export interface AIEmailRequest {
  serviceLine: ServiceLine;
  tone: AITone;
  topic: string;
  audience: string;
  sequencePosition?: number;
}

export interface AIEmailResponse {
  subject: string;
  previewText: string;
  body: string;
  complianceNotes: string[];
}

export interface AINewsletterRequest {
  serviceLine: ServiceLine;
  topics: string[];
  audienceDescription: string;
  sections: number;
}

export interface AINewsletterResponse {
  title: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  complianceNotes: string[];
}

export interface ComplianceReviewRequest {
  content: string;
  contentType: AIContentType;
  serviceLine?: ServiceLine;
}

export interface ComplianceIssue {
  severity: 'critical' | 'warning' | 'info';
  rule: string;
  description: string;
  suggestion: string;
  location?: string;
}

export interface ComplianceReviewResponse {
  overallScore: number;
  status: 'pass' | 'warning' | 'fail';
  issues: ComplianceIssue[];
  summary: string;
}

export interface PDFGenerateRequest {
  title: string;
  sections: Array<{ heading: string; body: string }>;
  serviceLine: ServiceLine;
  type: 'newsletter' | 'email';
}
