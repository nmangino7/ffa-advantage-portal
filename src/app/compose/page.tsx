'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { getEmailConfig } from '@/lib/email-service';
import type { Contact, EmailStep } from '@/lib/types';
import {
  Send, Loader2, Search, X, ChevronDown, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Shield, FileText, User, Mail,
  Zap,
} from 'lucide-react';

export default function ComposePage() {
  const { contacts, campaigns, customTemplates } = usePortal();
  const { showToast } = useToast();

  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);
  const [complianceChecking, setComplianceChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<{ passed: boolean; issues: string[] } | null>(null);
  const [sendResult, setSendResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  const emailConfig = useMemo(() => getEmailConfig(), []);

  // Contact search filtering
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts.slice(0, 20);
    const q = contactSearch.toLowerCase();
    return contacts
      .filter(c =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [contacts, contactSearch]);

  // All available templates from campaigns and custom templates
  const allTemplates = useMemo(() => {
    const templates: { label: string; email: EmailStep; campaignName: string }[] = [];
    for (const camp of campaigns) {
      for (const step of camp.emailSequence) {
        templates.push({
          label: `${camp.name} — Email ${step.sendDay === 0 ? '1' : `Day ${step.sendDay}`}`,
          email: step,
          campaignName: camp.name,
        });
      }
    }
    for (const ct of customTemplates) {
      templates.push({
        label: `[Custom] ${ct.subject}`,
        email: ct,
        campaignName: 'Custom Template',
      });
    }
    return templates;
  }, [campaigns, customTemplates]);

  function selectContact(contact: Contact) {
    setSelectedContact(contact);
    setRecipientEmail(contact.email);
    setRecipientName(`${contact.firstName} ${contact.lastName}`);
    setShowContactPicker(false);
    setContactSearch('');
  }

  function clearContact() {
    setSelectedContact(null);
    setRecipientEmail('');
    setRecipientName('');
  }

  function applyTemplate(template: { email: EmailStep }) {
    let templateBody = template.email.body;
    // Replace personalization tokens
    if (selectedContact) {
      templateBody = templateBody
        .replace(/\{\{first_name\}\}/g, selectedContact.firstName)
        .replace(/\{\{last_name\}\}/g, selectedContact.lastName)
        .replace(/\{\{company\}\}/g, selectedContact.company)
        .replace(/\{\{email\}\}/g, selectedContact.email);
    }
    setSubject(template.email.subject);
    setBody(templateBody);
    setShowTemplatePicker(false);
    showToast('Template applied');
  }

  const handleComplianceCheck = useCallback(async () => {
    setComplianceChecking(true);
    setComplianceResult(null);
    try {
      const res = await fetch('/api/email/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, serviceLine: 'Insurance Review' }),
      });
      const data = await res.json();
      setComplianceResult(data);
      return data.passed;
    } catch {
      setComplianceResult({ passed: false, issues: ['Failed to run compliance check'] });
      return false;
    } finally {
      setComplianceChecking(false);
    }
  }, [body]);

  async function handleSend() {
    if (!recipientEmail || !subject || !body) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSending(true);
    setSendResult(null);

    // Run compliance check first
    const passed = await handleComplianceCheck();

    try {
      const config = getEmailConfig();
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailRequest: {
            to: recipientEmail,
            toName: recipientName || recipientEmail,
            subject,
            body,
            bodyFormat: 'html' as const,
          },
          emailConfig: config,
        }),
      });
      const data = await res.json();
      setSendResult(data);
      if (data.success) {
        showToast(`Email sent via ${data.provider}${!passed ? ' (compliance warnings exist)' : ''}`);
      } else {
        showToast(data.error || 'Failed to send email', 'error');
      }
    } catch {
      setSendResult({ success: false, error: 'Network error' });
      showToast('Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  }

  const isFormValid = recipientEmail.trim() && subject.trim() && body.trim();

  const providerLabels: Record<string, { label: string; color: string }> = {
    simulation: { label: 'Simulation Mode', color: 'bg-amber-100 text-amber-700' },
    hubspot: { label: 'HubSpot', color: 'bg-orange-100 text-orange-700' },
    outlook: { label: 'Outlook', color: 'bg-blue-100 text-blue-700' },
    resend: { label: 'Resend', color: 'bg-emerald-100 text-emerald-700' },
    sendgrid: { label: 'SendGrid', color: 'bg-indigo-100 text-indigo-700' },
    mailgun: { label: 'Mailgun', color: 'bg-red-100 text-red-700' },
    smtp: { label: 'SMTP', color: 'bg-violet-100 text-violet-700' },
  };

  const currentProvider = providerLabels[emailConfig.provider] || providerLabels.simulation;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-up">
      <PageHeader title="Compose Email" subtitle="Write and send an email to a contact" />

      {/* Provider Status Bar */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-xl border border-neutral-200">
        <Zap className="w-4 h-4 text-neutral-400" />
        <span className="text-xs text-neutral-500">Sending via:</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentProvider.color}`}>
          {currentProvider.label}
        </span>
        {emailConfig.provider === 'simulation' && (
          <span className="text-[10px] text-neutral-400 ml-auto">Emails will be logged, not delivered. Configure a provider in Settings.</span>
        )}
      </div>

      <div className="space-y-5">
        {/* Recipient Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-neutral-400" />
            <label className="text-sm font-semibold text-neutral-900">To</label>
          </div>

          {selectedContact ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {selectedContact.firstName[0]}{selectedContact.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {selectedContact.firstName} {selectedContact.lastName}
                </p>
                <p className="text-xs text-neutral-500 truncate">{selectedContact.email} · {selectedContact.company}</p>
              </div>
              <button onClick={clearContact} className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                  <input
                    type="text"
                    value={contactSearch || recipientEmail}
                    onChange={e => {
                      const val = e.target.value;
                      setContactSearch(val);
                      if (val.includes('@')) setRecipientEmail(val);
                      setShowContactPicker(true);
                    }}
                    onFocus={() => setShowContactPicker(true)}
                    placeholder="Search contacts or type an email address..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {showContactPicker && filteredContacts.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  {filteredContacts.map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectContact(c)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-600">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{c.email} · {c.company}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual name if typing email directly */}
          {!selectedContact && recipientEmail.includes('@') && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-500 mb-1">Recipient Name (optional)</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Template Picker */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-400" />
              <label className="text-sm font-semibold text-neutral-900">Template</label>
              <span className="text-xs text-neutral-400">(optional)</span>
            </div>
            <button
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              {showTemplatePicker ? 'Hide' : 'Choose Template'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplatePicker ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showTemplatePicker && (
            <div className="max-h-48 overflow-y-auto border border-neutral-100 rounded-lg">
              {allTemplates.length === 0 ? (
                <p className="p-3 text-xs text-neutral-400 text-center">No templates available</p>
              ) : (
                allTemplates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => applyTemplate(t)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 border-b border-neutral-50 last:border-0 transition-colors"
                  >
                    <p className="font-medium text-neutral-800 truncate">{t.email.subject}</p>
                    <p className="text-neutral-400 truncate mt-0.5">{t.label}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-neutral-400" />
            <label className="text-sm font-semibold text-neutral-900">Subject</label>
          </div>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Enter email subject line..."
            className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Body Editor */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-neutral-900">Body</label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="min-h-[300px] p-4 border border-neutral-100 rounded-lg bg-neutral-50">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body || '<p class="text-neutral-300">Nothing to preview yet...</p>' }} />
            </div>
          ) : (
            <RichTextEditor
              initialContent={body}
              onChange={setBody}
              placeholder="Write your email content here..."
            />
          )}
        </div>

        {/* Compliance Result */}
        {complianceResult && (
          <div className={`rounded-xl border p-4 ${
            complianceResult.passed
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {complianceResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span className={`text-xs font-semibold ${complianceResult.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {complianceResult.passed ? 'Compliance Check Passed' : 'Compliance Warnings'}
              </span>
            </div>
            {complianceResult.issues.length > 0 && (
              <ul className="space-y-1 mt-2">
                {complianceResult.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Send Result */}
        {sendResult && (
          <div className={`rounded-xl border p-4 ${
            sendResult.success
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-semibold ${sendResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {sendResult.success ? `Email sent successfully! ID: ${sendResult.messageId}` : sendResult.error}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSend}
            disabled={!isFormValid || sending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Email
              </>
            )}
          </button>

          <button
            onClick={handleComplianceCheck}
            disabled={!body.trim() || complianceChecking}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white text-neutral-700 text-sm font-semibold rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-40"
          >
            {complianceChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Check Compliance
          </button>
        </div>
      </div>
    </div>
  );
}
