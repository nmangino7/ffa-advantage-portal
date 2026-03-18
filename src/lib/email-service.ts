// ─── Email Service Utility ─────────────────────────────────────
// Client-side abstraction for email sending configuration

export interface EmailConfig {
  provider: 'hubspot' | 'outlook' | 'simulation';
  hubspotApiKey?: string;
  outlookClientId?: string;
  outlookTenantId?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  companyName: string;
  companyAddress: string;
  unsubscribeUrl: string;
}

export interface SendEmailRequest {
  to: string;
  toName: string;
  subject: string;
  body: string;
  bodyFormat: 'html' | 'text';
  campaignId?: string;
  campaignName?: string;
  fromAdvisor?: { name: string; email: string };
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface ComplianceCheckRequest {
  body: string;
  serviceLine: string;
}

export interface ComplianceCheckResponse {
  passed: boolean;
  issues: string[];
}

const EMAIL_CONFIG_KEY = 'ffa-email-config';

const DEFAULT_CONFIG: EmailConfig = {
  provider: 'simulation',
  fromName: 'FFA North Team',
  fromEmail: 'outreach@ffanorth.com',
  replyToEmail: 'outreach@ffanorth.com',
  companyName: 'Florida Financial Advisors',
  companyAddress: '1234 Main Street, Suite 100, Tampa, FL 33602',
  unsubscribeUrl: 'https://ffanorth.com/unsubscribe',
};

export function getEmailConfig(): EmailConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveEmailConfig(config: EmailConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('[email-service] Failed to save config:', e);
  }
}

export function buildCanSpamFooter(config: EmailConfig): string {
  return `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #737373; line-height: 1.5;">
  <p style="margin: 0 0 4px 0;">${config.companyName}</p>
  <p style="margin: 0 0 4px 0;">${config.companyAddress}</p>
  <p style="margin: 0;">
    <a href="${config.unsubscribeUrl}" style="color: #6366f1; text-decoration: underline;">Unsubscribe</a>
    from future emails.
  </p>
</div>`;
}
