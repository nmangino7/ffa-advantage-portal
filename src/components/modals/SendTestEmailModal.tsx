'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { getEmailConfig } from '@/lib/email-service';
import type { SendEmailResponse, ComplianceCheckResponse } from '@/lib/email-service';
import { EmailPreview } from '@/components/ui/EmailPreview';
import { X, Send, Loader2, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Mail } from 'lucide-react';

export function SendTestEmailModal() {
  const { sendTestModal, closeAll } = useModal();
  const { campaigns } = usePortal();
  const { showToast } = useToast();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedEmailIdx, setSelectedEmailIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const [complianceChecking, setComplianceChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResponse | null>(null);
  const [sendResult, setSendResult] = useState<SendEmailResponse | null>(null);

  const campaign = sendTestModal ? campaigns.find(c => c.id === sendTestModal.campaignId) : null;
  const emailSteps = campaign?.emailSequence || [];
  const selectedEmail = emailSteps[selectedEmailIdx] || null;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (sendTestModal) {
      setRecipientEmail('');
      setSelectedEmailIdx(0);
      setSending(false);
      setComplianceChecking(false);
      setComplianceResult(null);
      setSendResult(null);
    }
  }, [sendTestModal]);

  // Auto-run compliance check when email selection changes
  useEffect(() => {
    if (selectedEmail && sendTestModal) {
      runComplianceCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmailIdx, sendTestModal]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (sendTestModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [sendTestModal, handleEscape]);

  async function runComplianceCheck() {
    if (!selectedEmail) return;
    setComplianceChecking(true);
    setComplianceResult(null);
    try {
      const res = await fetch('/api/email/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: selectedEmail.body,
          serviceLine: campaign?.serviceLine || '',
        }),
      });
      const data: ComplianceCheckResponse = await res.json();
      setComplianceResult(data);
    } catch {
      setComplianceResult({ passed: false, issues: ['Failed to run compliance check'] });
    } finally {
      setComplianceChecking(false);
    }
  }

  async function handleSend() {
    if (!recipientEmail.trim() || !selectedEmail || !campaign) return;
    setSending(true);
    setSendResult(null);
    try {
      const config = getEmailConfig();
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailRequest: {
            to: recipientEmail.trim(),
            toName: 'Test Recipient',
            subject: selectedEmail.subject,
            body: selectedEmail.body,
            bodyFormat: selectedEmail.bodyFormat || 'html',
            campaignId: campaign.id,
            campaignName: campaign.name,
          },
          emailConfig: config,
        }),
      });
      const data: SendEmailResponse = await res.json();
      setSendResult(data);
      if (data.success) {
        showToast(`Test email sent via ${data.provider}${data.provider === 'simulation' ? ' (simulated)' : ''}`);
      } else {
        showToast(data.error || 'Failed to send test email', 'error');
      }
    } catch {
      showToast('Failed to send test email', 'error');
      setSendResult({ success: false, error: 'Network error', provider: 'none' });
    } finally {
      setSending(false);
    }
  }

  if (!sendTestModal || !campaign) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim());
  const canSend = isEmailValid && selectedEmail && !sending;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeAll}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Send className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Send Test Email</h2>
              <p className="text-xs text-neutral-400">{campaign.name} &middot; {emailSteps.length} emails in sequence</p>
            </div>
          </div>
          <button onClick={closeAll} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-neutral-100 h-full">
            {/* Left: Form */}
            <div className="overflow-y-auto p-6 space-y-5">
              {/* Recipient */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Recipient Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                {recipientEmail && !isEmailValid && (
                  <p className="text-[11px] text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>

              {/* Email Select */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Select Email from Sequence</label>
                <select
                  value={selectedEmailIdx}
                  onChange={e => setSelectedEmailIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {emailSteps.map((step, i) => (
                    <option key={step.id} value={i}>
                      Email {i + 1} (Day {step.sendDay}): {step.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Compliance Pre-flight */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-500">Compliance Pre-flight Check</span>
                </div>
                {complianceChecking ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                    <span className="text-xs text-neutral-500">Running compliance checks...</span>
                  </div>
                ) : complianceResult ? (
                  <div className={`p-3 rounded-lg border ${
                    complianceResult.passed
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {complianceResult.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-700">All checks passed</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-700">{complianceResult.issues.length} issue{complianceResult.issues.length !== 1 ? 's' : ''} found</span>
                        </>
                      )}
                    </div>
                    {complianceResult.issues.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {complianceResult.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[11px] text-amber-800 leading-relaxed">{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Send Result */}
              {sendResult && (
                <div className={`p-3 rounded-lg border ${
                  sendResult.success
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  {sendResult.success ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">
                          Test email sent successfully
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 mt-1">
                        Provider: {sendResult.provider} &middot; Message ID: {sendResult.messageId}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">{sendResult.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Provider info */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] text-neutral-500">
                  <span className="font-semibold">Provider:</span>{' '}
                  {(() => {
                    const p = getEmailConfig().provider;
                    switch (p) {
                      case 'simulation': return 'Simulation (no real email sent)';
                      case 'hubspot': return 'HubSpot Transactional Email';
                      case 'outlook': return 'Microsoft Outlook (Graph API)';
                      case 'resend': return 'Resend';
                      case 'sendgrid': return 'SendGrid';
                      case 'mailgun': return 'Mailgun';
                      case 'smtp': return 'SMTP';
                      default: return p;
                    }
                  })()}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Subject will be prefixed with [TEST]. Configure in Settings &gt; Email Integration.
                </p>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="overflow-hidden flex flex-col">
              {selectedEmail ? (
                <EmailPreview
                  subject={`[TEST] ${selectedEmail.subject}`}
                  previewText={selectedEmail.previewText}
                  body={selectedEmail.body}
                  bodyFormat={selectedEmail.bodyFormat || 'html'}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
                  No email selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={runComplianceCheck}
            disabled={complianceChecking || !selectedEmail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-40"
          >
            {complianceChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
            Re-check Compliance
          </button>
          <div className="flex gap-2">
            <button onClick={closeAll} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
