'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePersistedState } from '@/lib/hooks/usePersistedState';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { Check, RotateCcw, Download, Info, Zap, Mail, Loader2, CheckCircle2, ChevronDown, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { getEmailConfig, saveEmailConfig, type EmailConfig } from '@/lib/email-service';

const sections = ['General', 'Email Integration', 'HubSpot', 'Compliance', 'Architecture', 'Roadmap'] as const;
type Section = typeof sections[number];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = usePersistedState<Section>('ffa-settings-tab', 'General');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      <PageHeader title="Settings" subtitle="Platform configuration, integrations, and documentation" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sub-Nav */}
        <nav className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-neutral-200 p-2 space-y-0.5 lg:sticky lg:top-20">
            {sections.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === s
                    ? 'bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'General' && <GeneralSection />}
          {activeSection === 'Email Integration' && <EmailIntegrationSection />}
          {activeSection === 'HubSpot' && <HubSpotSection />}
          {activeSection === 'Compliance' && <ComplianceSection />}
          {activeSection === 'Architecture' && <ArchitectureSection />}
          {activeSection === 'Roadmap' && <RoadmapSection />}
        </div>
      </div>
    </div>
  );
}

function GeneralSection() {
  const { contacts, campaigns, activities, customTemplates, resetToDefaults } = usePortal();
  const { showToast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      contacts: contacts.length,
      campaigns,
      activities: activities.slice(0, 100),
      customTemplates,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ffa-advantage-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  }, [contacts, campaigns, activities, customTemplates, showToast]);

  const handleReset = useCallback(() => {
    resetToDefaults();
    setConfirmReset(false);
    showToast('All data reset to demo defaults');
  }, [resetToDefaults, showToast]);

  return (
    <div className="space-y-6">
      {/* Simulation Mode */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-1">Simulation Mode</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              This portal is running in demo mode. Emails are <strong>not</strong> being sent — all campaign data, engagement metrics, and activity are simulated locally.
              When HubSpot is integrated, real emails will be sent through your connected provider.
            </p>
          </div>
        </div>
      </div>

      {/* What Works Today */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6" style={{ borderLeft: '3px solid #059669' }}>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">What Works Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { label: 'Create & edit campaigns with rich text emails', live: true },
            { label: 'Upload PDFs, images, and documents', live: true },
            { label: 'Enroll contacts in drip sequences', live: true },
            { label: 'Assign advisors to warm leads', live: true },
            { label: 'Track pipeline stages for contacts', live: true },
            { label: 'All data persists across browser sessions', live: true },
            { label: 'Send real emails via HubSpot / SendGrid', live: false },
            { label: 'Real-time open/click tracking', live: false },
            { label: 'Actual appointment scheduling', live: false },
            { label: 'Role-based access & SSO', live: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border ${
              item.live ? 'bg-emerald-50 border-emerald-100' : 'bg-neutral-50 border-neutral-100'
            }`}>
              {item.live ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-200 text-neutral-500 rounded font-semibold flex-shrink-0">SOON</span>
              )}
              <p className={`text-xs ${item.live ? 'text-emerald-800' : 'text-neutral-500'}`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6" style={{ borderLeft: '3px solid #2563eb' }}>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Your Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Contacts', value: contacts.length },
            { label: 'Campaigns', value: campaigns.length },
            { label: 'Activities', value: activities.length },
            { label: 'Templates', value: customTemplates.length },
          ].map(s => (
            <div key={s.label} className="bg-neutral-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
            <Download className="w-4 h-4" />
            Export Data (JSON)
          </button>

          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 text-sm font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Reset Demo Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Are you sure? This clears all your data.</span>
              <button onClick={handleReset}
                className="px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Yes, Reset
              </button>
              <button onClick={() => setConfirmReset(false)}
                className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Provider */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6" style={{ borderLeft: '3px solid #f59e0b' }}>
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">Email Provider</h2>
        <p className="text-xs text-neutral-500 mb-4">Real email sending requires a HubSpot integration. See the HubSpot section for setup details.</p>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-indigo-900 mb-1">Coming with HubSpot Integration</p>
            <ul className="text-xs text-indigo-800 space-y-1 list-disc pl-4">
              <li>Automated email sending through HubSpot Workflows</li>
              <li>Real-time open, click, and reply tracking</li>
              <li>Domain verification and deliverability monitoring</li>
              <li>Suppression list and CAN-SPAM compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailIntegrationSection() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<EmailConfig>(() => getEmailConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'none' | 'pending' | 'verified' | 'checking' | 'error'>('none');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showDomainAuth, setShowDomainAuth] = useState(false);

  async function handleVerifySender() {
    if (!config.sendgridApiKey) {
      setVerifyStatus('error');
      setVerifyError('Please enter your SendGrid API key first');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      // Parse company address into parts
      const addressParts = config.companyAddress.split(',').map(s => s.trim());
      const res = await fetch('/api/email/verify-sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.sendgridApiKey,
          fromName: config.fromName,
          fromEmail: config.fromEmail,
          replyTo: config.replyToEmail,
          company: config.companyName,
          address: addressParts[0] || config.companyAddress,
          city: addressParts[1] || 'Tampa',
          state: addressParts[2] || 'FL',
          zip: addressParts[3] || '33602',
          country: 'US',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyStatus('pending');
        showToast('Verification email sent! Check your inbox.');
      } else {
        setVerifyStatus('error');
        setVerifyError(data.error || 'Failed to initiate verification');
        showToast('Verification failed', 'error');
      }
    } catch {
      setVerifyStatus('error');
      setVerifyError('Network error - could not reach the API');
      showToast('Verification failed', 'error');
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleCheckVerification() {
    if (!config.sendgridApiKey || !config.fromEmail) {
      setVerifyStatus('error');
      setVerifyError('API key and from email are required');
      return;
    }
    setVerifyStatus('checking');
    setVerifyError('');
    try {
      const params = new URLSearchParams({ apiKey: config.sendgridApiKey, email: config.fromEmail });
      const res = await fetch(`/api/email/verify-sender?${params}`);
      const data = await res.json();
      if (data.error) {
        setVerifyStatus('error');
        setVerifyError(data.error);
      } else if (data.status === 'verified') {
        setVerifyStatus('verified');
        updateConfig({ senderVerified: true });
        showToast('Sender is verified!');
      } else if (data.status === 'pending') {
        setVerifyStatus('pending');
      } else {
        setVerifyStatus('none');
      }
    } catch {
      setVerifyStatus('error');
      setVerifyError('Network error - could not reach the API');
    }
  }

  function updateConfig(partial: Partial<EmailConfig>) {
    setConfig(prev => ({ ...prev, ...partial }));
    setTestResult(null);
  }

  function handleSave() {
    saveEmailConfig(config);
    showToast('Email integration settings saved');
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailRequest: {
            to: config.fromEmail,
            toName: 'Connection Test',
            subject: '[CONNECTION TEST] FFA Advantage Portal',
            body: '<p>This is a connection test email from the FFA Advantage Portal.</p>',
            bodyFormat: 'html',
          },
          emailConfig: config,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Connection successful via ${data.provider}. Message ID: ${data.messageId}` });
        showToast('Connection test successful');
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed' });
        showToast('Connection test failed', 'error');
      }
    } catch {
      setTestResult({ success: false, message: 'Network error - could not reach the API' });
      showToast('Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Email Provider</h2>
        </div>
        <p className="text-xs text-neutral-500 mb-4">Select how emails are sent from the portal. Simulation mode logs sends without delivering real emails.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {([
            { key: 'simulation' as const, label: 'Simulation', desc: 'Log sends locally (testing)', color: 'bg-neutral-50 border-neutral-200', icon: '🔬' },
            { key: 'resend' as const, label: 'Resend', desc: 'Simple email API — just needs an API key', color: 'bg-emerald-50 border-emerald-200', icon: '✉️' },
            { key: 'sendgrid' as const, label: 'SendGrid', desc: 'Industry-standard email by Twilio', color: 'bg-indigo-50 border-indigo-200', icon: '📧' },
            { key: 'mailgun' as const, label: 'Mailgun', desc: 'Reliable transactional email API', color: 'bg-red-50 border-red-200', icon: '📬' },
            { key: 'smtp' as const, label: 'SMTP / Gmail', desc: 'Any email — Gmail, Yahoo, custom SMTP', color: 'bg-violet-50 border-violet-200', icon: '🔧' },
            { key: 'hubspot' as const, label: 'HubSpot', desc: 'HubSpot transactional email API', color: 'bg-orange-50 border-orange-200', icon: '🟠' },
            { key: 'outlook' as const, label: 'Outlook', desc: 'Microsoft Graph sendMail API', color: 'bg-blue-50 border-blue-200', icon: '🔵' },
          ]).map(p => (
            <button
              key={p.key}
              onClick={() => updateConfig({ provider: p.key } as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                config.provider === p.key
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-100'
                  : `${p.color} hover:border-neutral-300 hover:shadow-sm`
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <p className="text-sm font-semibold text-neutral-900">{p.label}</p>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>

        {/* HubSpot fields */}
        {config.provider === 'hubspot' && (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-3 mb-4">
            <h3 className="text-xs font-semibold text-orange-900">HubSpot Configuration</h3>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">API Key / Private App Token</label>
              <input
                type="password"
                value={config.hubspotApiKey || ''}
                onChange={e => updateConfig({ hubspotApiKey: e.target.value })}
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              />
            </div>
          </div>
        )}

        {/* Outlook fields */}
        {config.provider === 'outlook' && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3 mb-4">
            <h3 className="text-xs font-semibold text-blue-900">Microsoft Outlook Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Client ID (Application ID)</label>
                <input
                  type="text"
                  value={config.outlookClientId || ''}
                  onChange={e => updateConfig({ outlookClientId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Tenant ID</label>
                <input
                  type="text"
                  value={config.outlookTenantId || ''}
                  onChange={e => updateConfig({ outlookTenantId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-blue-700">Note: The Client Secret should be set as an environment variable (OUTLOOK_CLIENT_SECRET) on the server.</p>
          </div>
        )}

        {config.provider === 'resend' && (
          <div className="space-y-3 mb-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <h3 className="text-xs font-semibold text-emerald-900">Resend Configuration</h3>
              <p className="text-[10px] text-emerald-700">Get your API key from <strong>resend.com/api-keys</strong>. Resend is the simplest option — just paste your API key and you&apos;re ready to send.</p>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">API Key</label>
                <input type="password" value={(config as any).resendApiKey || ''} onChange={e => updateConfig({ resendApiKey: e.target.value } as any)} placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 text-base leading-none mt-0.5">&#9888;</span>
                <div>
                  <h3 className="text-xs font-semibold text-amber-900">Domain Verification Required</h3>
                  <p className="text-[10px] text-amber-800 mt-1">To avoid spam folders, verify your sending domain in Resend. Without this, emails are sent from Resend&apos;s shared domain and may be flagged.</p>
                </div>
              </div>
              <ol className="text-[10px] text-amber-900 space-y-1.5 pl-5 list-decimal">
                <li>Go to <strong>resend.com &rarr; Domains &rarr; Add Domain</strong></li>
                <li>Enter your domain (e.g., <code className="bg-amber-100 px-1 rounded">georgiafa.com</code>)</li>
                <li>Add the <strong>DNS records</strong> Resend provides (MX, TXT for SPF, DKIM CNAME)</li>
                <li>Click <strong>&quot;Verify DNS Records&quot;</strong> in Resend dashboard</li>
                <li>Once verified, update your <strong>From Email</strong> below to use your domain</li>
              </ol>
            </div>
          </div>
        )}

        {config.provider === 'sendgrid' && (
          <div className="space-y-3 mb-4">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
              <h3 className="text-xs font-semibold text-indigo-900">SendGrid Configuration</h3>
              <p className="text-[10px] text-indigo-700">Get your API key from <strong>app.sendgrid.com &rarr; Settings &rarr; API Keys</strong>. Use a key with &quot;Mail Send&quot; and &quot;Sender Verification&quot; permissions.</p>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">API Key</label>
                <input type="password" value={(config as any).sendgridApiKey || ''} onChange={e => updateConfig({ sendgridApiKey: e.target.value } as any)} placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
            </div>

            {/* Sender Verification Card */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-4">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-neutral-900">Sender Verification</h3>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    Verify your sender email to improve deliverability and avoid spam folders.
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-neutral-500">Status:</span>
                {verifyStatus === 'none' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Not Verified
                  </span>
                )}
                {verifyStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Verification Pending &mdash; Check Your Inbox
                  </span>
                )}
                {verifyStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
                {verifyStatus === 'checking' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking...
                  </span>
                )}
                {verifyStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Error
                  </span>
                )}
              </div>

              {verifyError && (
                <p className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{verifyError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleVerifySender}
                  disabled={verifyLoading || verifyStatus === 'verified'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40"
                >
                  {verifyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  Verify My Email
                </button>
                <button
                  onClick={handleCheckVerification}
                  disabled={verifyStatus === 'checking'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 text-[11px] font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-40"
                >
                  {verifyStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                  Check Status
                </button>
              </div>

              {verifyStatus === 'pending' && (
                <p className="text-[10px] text-amber-800 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                  After clicking &quot;Verify My Email&quot;, check your inbox for a verification email from SendGrid and click the confirmation link.
                </p>
              )}
            </div>

            {/* Collapsible Advanced Domain Authentication */}
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <button
                onClick={() => setShowDomainAuth(!showDomainAuth)}
                className="w-full flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
              >
                {showDomainAuth ? <ChevronDown className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />}
                <span className="text-[11px] font-semibold text-neutral-600">Advanced: Full Domain Authentication</span>
                <span className="text-[9px] text-neutral-400 ml-auto">Best deliverability</span>
              </button>
              {showDomainAuth && (
                <div className="p-4 space-y-3 border-t border-neutral-200 bg-white">
                  <p className="text-[10px] text-neutral-600">
                    For the best deliverability, authenticate your sending domain in SendGrid. This removes the &quot;via sendgrid.net&quot; label and passes Gmail&apos;s authentication checks.
                  </p>
                  <ol className="text-[10px] text-neutral-700 space-y-1.5 pl-5 list-decimal">
                    <li>Go to <strong>app.sendgrid.com &rarr; Settings &rarr; Sender Authentication</strong></li>
                    <li>Click <strong>&quot;Authenticate Your Domain&quot;</strong></li>
                    <li>Enter your sending domain (e.g., <code className="bg-neutral-100 px-1 rounded">georgiafa.com</code>)</li>
                    <li>SendGrid will give you <strong>3 CNAME records</strong> &mdash; add them to your DNS provider (GoDaddy, Cloudflare, etc.)</li>
                    <li>Return to SendGrid and click <strong>&quot;Verify&quot;</strong></li>
                    <li>Once verified, the &quot;via sendgrid.net&quot; label disappears and emails land in inbox</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {config.provider === 'mailgun' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 mb-4">
            <h3 className="text-xs font-semibold text-red-900">Mailgun Configuration</h3>
            <p className="text-[10px] text-red-700">Get your API key from <strong>app.mailgun.com &rarr; API Security</strong>. You also need your sending domain.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">API Key</label>
                <input type="password" value={(config as any).mailgunApiKey || ''} onChange={e => updateConfig({ mailgunApiKey: e.target.value } as any)} placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Sending Domain</label>
                <input type="text" value={(config as any).mailgunDomain || ''} onChange={e => updateConfig({ mailgunDomain: e.target.value } as any)} placeholder="mg.yourdomain.com" className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
            </div>
          </div>
        )}

        {config.provider === 'smtp' && (
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 space-y-3 mb-4">
            <h3 className="text-xs font-semibold text-violet-900">SMTP Configuration</h3>
            <p className="text-[10px] text-violet-700">Works with Gmail, Yahoo, or any SMTP server. For Gmail, use an <strong>App Password</strong> (not your regular password) from myaccount.google.com &rarr; Security &rarr; App Passwords.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">SMTP Host</label>
                <input type="text" value={(config as any).smtpHost || ''} onChange={e => updateConfig({ smtpHost: e.target.value } as any)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Port</label>
                <input type="number" value={(config as any).smtpPort || 587} onChange={e => updateConfig({ smtpPort: parseInt(e.target.value) || 587 } as any)} className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Username / Email</label>
                <input type="text" value={(config as any).smtpUser || ''} onChange={e => updateConfig({ smtpUser: e.target.value } as any)} placeholder="your.email@gmail.com" className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Password / App Password</label>
                <input type="password" value={(config as any).smtpPass || ''} onChange={e => updateConfig({ smtpPass: e.target.value } as any)} placeholder="xxxx xxxx xxxx xxxx" className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-violet-800 cursor-pointer">
              <input type="checkbox" checked={(config as any).smtpSecure ?? false} onChange={e => updateConfig({ smtpSecure: e.target.checked } as any)} className="rounded border-violet-300" />
              Use SSL/TLS (port 465). Leave unchecked for STARTTLS (port 587).
            </label>
          </div>
        )}
      </div>

      {/* Sender Information */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6" style={{ borderLeft: '3px solid #6366f1' }}>
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Sender Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">From Name</label>
            <input
              type="text"
              value={config.fromName}
              onChange={e => updateConfig({ fromName: e.target.value })}
              placeholder="FFA North Team"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">From Email</label>
            <input
              type="email"
              value={config.fromEmail}
              onChange={e => updateConfig({ fromEmail: e.target.value })}
              placeholder="outreach@ffanorth.com"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reply-To Email</label>
            <input
              type="email"
              value={config.replyToEmail}
              onChange={e => updateConfig({ replyToEmail: e.target.value })}
              placeholder="outreach@ffanorth.com"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* CAN-SPAM Footer */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6" style={{ borderLeft: '3px solid #7c3aed' }}>
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">CAN-SPAM Footer</h2>
        <p className="text-xs text-neutral-500 mb-4">This information is automatically appended to every outgoing email for compliance.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Company Name</label>
            <input
              type="text"
              value={config.companyName}
              onChange={e => updateConfig({ companyName: e.target.value })}
              placeholder="Florida Financial Advisors"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Unsubscribe URL</label>
            <input
              type="url"
              value={config.unsubscribeUrl}
              onChange={e => updateConfig({ unsubscribeUrl: e.target.value })}
              placeholder="https://ffanorth.com/unsubscribe"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Company Address</label>
            <input
              type="text"
              value={config.companyAddress}
              onChange={e => updateConfig({ companyAddress: e.target.value })}
              placeholder="1234 Main Street, Suite 100, Tampa, FL 33602"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Test Connection Result */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${
          testResult.success
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Info className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-xs font-semibold ${testResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
              {testResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all"
        >
          <Check className="w-4 h-4" />
          Save Settings
        </button>
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-700 text-sm font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-40"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}

function HubSpotSection() {
  const steps = [
    { title: 'HubSpot API Authentication', detail: 'Set up a HubSpot Private App with scoped permissions for contacts, deals, and marketing emails.', effort: '1 day' },
    { title: 'Contact Sync (~500K)', detail: 'Replace mock data with HubSpot Contacts API calls. Map properties like name, email, company, and phone.', effort: '3-4 days' },
    { title: 'Campaign / Email Mapping', detail: 'Map HubSpot Marketing Emails and Workflows to our Campaign model. Track sends, opens, clicks, and replies.', effort: '3-4 days' },
    { title: 'Pipeline Stage Mapping', detail: 'Create a HubSpot Deal Pipeline with 5 stages matching our lifecycle. Auto-sync stage transitions.', effort: '2 days' },
    { title: 'Activity & Engagement Sync', detail: 'Pull engagement data from HubSpot Engagements API. Calculate real intent scores from actual engagement data.', effort: '2-3 days' },
    { title: 'Webhook Setup', detail: 'Configure HubSpot webhooks for real-time updates on contact changes, email events, and deal stage transitions.', effort: '1-2 days' },
  ];

  const checklist = [
    { label: 'Create HubSpot Private App with required scopes', scope: 'crm.objects.contacts.read, crm.objects.deals.write, marketing-emails' },
    { label: 'Set up Deal Pipeline with 5 custom stages', scope: 'Dormant \u2192 Education \u2192 Intent \u2192 Qualified \u2192 Licensed Rep' },
    { label: 'Create custom Contact Properties', scope: 'intent_score (number), portal_stage (dropdown)' },
    { label: 'Configure 20 Marketing Email Templates', scope: '5 service lines x 4 emails each' },
    { label: 'Set up Enrollment Workflows', scope: 'Trigger: contact property change \u2192 enroll in sequence' },
    { label: 'Configure Webhook Subscriptions', scope: 'Contact updates, email events, deal stage changes' },
    { label: 'Import existing contact database', scope: '~500K dormant contacts with proper field mapping' },
    { label: 'Set up suppression lists', scope: 'Opt-outs, do-not-contact, bounced emails' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Connect */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🟠</span>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">HubSpot Quick Connect</h2>
            <p className="text-xs text-neutral-500">Enter your Private App Token to enable HubSpot email sending</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Private App Token</label>
            <input type="password" placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" onChange={e => {
              const config = getEmailConfig();
              saveEmailConfig({ ...config, hubspotApiKey: e.target.value });
            }} defaultValue={getEmailConfig().hubspotApiKey || ''} />
          </div>
          <p className="text-[10px] text-neutral-400">Go to HubSpot &rarr; Settings &rarr; Integrations &rarr; Private Apps &rarr; Create a private app with scopes: <code className="bg-neutral-100 px-1 rounded">crm.objects.contacts.read</code>, <code className="bg-neutral-100 px-1 rounded">content</code></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Integration Steps</h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-neutral-900">{step.title}</p>
                  <span className="text-[10px] text-neutral-400 bg-white px-2 py-0.5 rounded-md border border-neutral-100">{step.effort}</span>
                </div>
                <p className="text-xs text-neutral-600">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">HubSpot Setup Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-4 h-4 rounded border-2 border-neutral-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-neutral-900">{item.label}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{item.scope}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComplianceSection() {
  const rules = [
    { rule: 'Rule 2210', title: 'Communications with the Public', summary: 'All firm communications must be fair, balanced, and not misleading. Requires clear firm identification and balanced risk/benefit presentation.', impact: 'Every email template must be reviewed for compliance before going live.' },
    { rule: 'Rule 2111', title: 'Suitability', summary: 'Firms must have a reasonable basis for recommending products. Our education-only approach avoids suitability triggers.', impact: 'The Qualified stage is where suitability is assessed before advisor handoff.' },
    { rule: 'Rule 3110', title: 'Supervision', summary: 'A designated principal must review and approve all marketing materials before use.', impact: 'Campaign approval workflow requires sign-off before any email goes active.' },
    { rule: 'Rule 4511', title: 'Books and Records', summary: 'All communications must be retained for at least 3 years. HubSpot logging plus our activity timeline creates an audit trail.', impact: 'Activity timeline automatically records all communications.' },
    { rule: 'CAN-SPAM', title: 'Email Marketing Compliance', summary: 'Commercial emails must include sender identification, physical address, and clear opt-out mechanism.', impact: 'HubSpot handles suppression. Portal never re-enrolls opted-out contacts.' },
  ];

  const safeguards = [
    'All email sequences are education-only \u2014 no specific product recommendations',
    'No performance guarantees or misleading claims in any template',
    'Clear firm identification (FFA North) in every email',
    'One-click unsubscribe in every email (HubSpot managed)',
    'Licensed associate must approve before contact reaches Licensed Rep stage',
    'Full activity audit trail for every contact interaction',
    'Supervisory review workflow for all new email templates',
    'State-level do-not-contact list compliance',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-amber-900 mb-1">Compliance is built into every layer of this platform.</p>
        <p className="text-xs text-amber-800">The education-only approach, supervisory review workflow, and automatic audit trail ensure FINRA compliance at every step. All marketing materials should still go through your firm&apos;s designated principal for review.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Built-in Safeguards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {safeguards.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Key FINRA Rules</h2>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{r.rule}</span>
                <span className="text-sm font-semibold text-neutral-900">{r.title}</span>
              </div>
              <p className="text-xs text-neutral-600 mb-2">{r.summary}</p>
              <p className="text-[11px] text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                <strong>Portal Impact:</strong> {r.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">Technical Architecture</h2>
        <div className="bg-neutral-900 rounded-xl p-6 font-mono text-sm text-neutral-300">
          <p className="text-neutral-500">{'// Current MVP (with local persistence)'}</p>
          <p className="text-emerald-400">Next.js App (Vercel) &rarr; localStorage + IndexedDB &rarr; UI</p>
          <br />
          <p className="text-neutral-500">{'// Production'}</p>
          <p className="text-indigo-400">Next.js App (Vercel)</p>
          <p className="text-neutral-400">&nbsp;&nbsp;├── API Routes &rarr; HubSpot Private App API</p>
          <p className="text-neutral-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/contacts &rarr; Contacts API</p>
          <p className="text-neutral-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/campaigns &rarr; Workflows + Email Events</p>
          <p className="text-neutral-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/pipeline &rarr; Deal Pipeline</p>
          <p className="text-neutral-400">&nbsp;&nbsp;│&nbsp;&nbsp;└── /api/activities &rarr; Engagements API</p>
          <p className="text-neutral-400">&nbsp;&nbsp;├── Webhooks ← HubSpot (real-time)</p>
          <p className="text-neutral-400">&nbsp;&nbsp;├── NextAuth.js &rarr; SSO / Auth</p>
          <p className="text-neutral-400">&nbsp;&nbsp;└── Edge Functions &rarr; Intent Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Data Layer', desc: 'localStorage + IndexedDB for MVP. Each data call is swappable — when HubSpot connects, zero UI changes needed.' },
          { title: 'Authentication', desc: 'NextAuth.js with credentials for MVP, upgradeable to SSO for production. Role-based access per page.' },
          { title: 'Deployment', desc: 'Vercel handles hosting, SSL, CDN, auto-scaling. Push to GitHub = auto deploy. API keys stored in env vars.' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm font-semibold text-neutral-900 mb-1">{item.title}</p>
            <p className="text-xs text-neutral-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapSection() {
  const phases = [
    { phase: '1', title: 'HubSpot Integration', status: 'Next Up', color: '#d97706', timeline: '2-3 weeks', items: ['API auth setup', 'Contact sync (500K)', 'Campaign mapping', 'Pipeline stage sync', 'Activity sync', 'Webhooks'] },
    { phase: '2', title: 'Governance Model', status: 'Phase 2', color: '#6366f1', timeline: '1-2 weeks', items: ['Role-based access control', 'Lead routing rules', 'Audit trail & reporting'] },
    { phase: '3', title: 'Scale & Optimize', status: 'Future', color: '#a3a3a3', timeline: 'Ongoing', items: ['ML intent scoring', 'A/B testing framework', 'Multi-channel expansion', 'ROI attribution dashboard'] },
  ];

  return (
    <div className="space-y-4">
      {phases.map(p => (
        <div key={p.phase} className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: p.color }}>
              {p.phase}
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-900">{p.title}</h3>
              <p className="text-xs text-neutral-400">{p.timeline}</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: p.color + '15', color: p.color }}>
              {p.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {p.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="w-4 h-4 rounded border-2 border-neutral-300 flex-shrink-0" />
                <p className="text-xs text-neutral-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
