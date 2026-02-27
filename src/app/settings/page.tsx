'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { Check, Mail, Settings, Send, Server } from 'lucide-react';

const tabs = ['Email Connection', 'HubSpot Integration', 'FINRA Compliance', 'Architecture', 'Roadmap'] as const;
type Tab = typeof tabs[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Email Connection');

  return (
    <div className="max-w-[1000px]">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration, integration guides, and compliance documentation"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Email Connection' && <EmailConnectionTab />}
      {activeTab === 'HubSpot Integration' && <HubSpotTab />}
      {activeTab === 'FINRA Compliance' && <FINRATab />}
      {activeTab === 'Architecture' && <ArchitectureTab />}
      {activeTab === 'Roadmap' && <RoadmapTab />}
    </div>
  );
}

const EMAIL_PROVIDERS = [
  { id: 'hubspot', name: 'HubSpot', iconName: 'settings', color: '#ff7a59', desc: 'Full CRM + email marketing platform' },
  { id: 'sendgrid', name: 'SendGrid', iconName: 'send', color: '#1A82E2', desc: 'Scalable email delivery API' },
  { id: 'mailchimp', name: 'Mailchimp', iconName: 'mail', color: '#FFE01B', desc: 'Email marketing & automation' },
  { id: 'smtp', name: 'Custom SMTP', iconName: 'settings', color: '#64748b', desc: 'Connect any SMTP server' },
];

const WIZARD_STEPS = ['Choose Provider', 'API Credentials', 'Verify Domain', 'Test Send', 'Connected'];

function EmailConnectionTab() {
  const [wizardStep, setWizardStep] = useState(0);
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [domain, setDomain] = useState('ffanorth.com');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  function handleVerify() {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setWizardStep(3); }, 1500);
  }

  function handleTestSend() {
    setSending(true);
    setTimeout(() => { setSending(false); setWizardStep(4); }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-1">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                i === wizardStep ? 'bg-blue-600 text-white' :
                i < wizardStep ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-400'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {i < wizardStep ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="truncate">{s}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <span className="text-slate-300 text-xs">&rarr;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Choose Provider */}
      {wizardStep === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Choose Your Email Provider</h2>
          <p className="text-sm text-slate-500 mb-5">Select the service you use to send emails. You can change this later.</p>
          <div className="grid grid-cols-2 gap-3">
            {EMAIL_PROVIDERS.map(p => (
              <button key={p.id} onClick={() => setProvider(p.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  provider === p.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: p.color + '15' }}>
                  <Icon name={p.iconName} className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <p className="text-sm font-bold text-slate-900 mt-2">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">
            <button onClick={() => setWizardStep(1)} disabled={!provider}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: API Credentials */}
      {wizardStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Enter API Credentials</h2>
          <p className="text-sm text-slate-500 mb-5">
            Enter your {EMAIL_PROVIDERS.find(p => p.id === provider)?.name} API key. This is stored securely and used to send emails on your behalf.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-800">
                <strong>Where to find this:</strong> Go to your {EMAIL_PROVIDERS.find(p => p.id === provider)?.name} dashboard &rarr; Settings &rarr; API Keys &rarr; Create New Key with &quot;Send Email&quot; permissions.
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-5 pt-4 border-t border-slate-100">
            <button onClick={() => setWizardStep(0)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              &larr; Back
            </button>
            <button onClick={() => setWizardStep(2)} disabled={apiKey.length < 5}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verify Domain */}
      {wizardStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Verify Sending Domain</h2>
          <p className="text-sm text-slate-500 mb-5">Verify your domain to improve email deliverability and avoid spam filters.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sending Domain</label>
              <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">Add these DNS records to verify your domain:</p>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="bg-white rounded-lg p-2 border border-slate-100">
                  <span className="text-blue-600">TXT</span> &nbsp; _dmarc.{domain} &nbsp; <span className="text-slate-500">v=DMARC1; p=none</span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-100">
                  <span className="text-blue-600">CNAME</span> &nbsp; em1234.{domain} &nbsp; <span className="text-slate-500">u1234.wl.sendgrid.net</span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-100">
                  <span className="text-blue-600">TXT</span> &nbsp; {domain} &nbsp; <span className="text-slate-500">v=spf1 include:sendgrid.net ~all</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-5 pt-4 border-t border-slate-100">
            <button onClick={() => setWizardStep(1)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              &larr; Back
            </button>
            <button onClick={handleVerify} disabled={verifying}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70">
              {verifying ? 'Verifying...' : 'Verify Domain'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Test Send */}
      {wizardStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Domain Verified!</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">Your domain is verified. Let&apos;s send a test email to make sure everything works.</p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
            <p className="text-xs text-slate-600"><strong>From:</strong> FFA North Team &lt;outreach@{domain}&gt;</p>
            <p className="text-xs text-slate-600"><strong>To:</strong> nick@{domain}</p>
            <p className="text-xs text-slate-600"><strong>Subject:</strong> Test Email from The Advantage Platform</p>
            <p className="text-xs text-slate-500 mt-2">This is a test email to verify your email connection is working correctly.</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setWizardStep(2)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              &larr; Back
            </button>
            <button onClick={handleTestSend} disabled={sending}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70">
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Connected */}
      {wizardStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Email Connected!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your {EMAIL_PROVIDERS.find(p => p.id === provider)?.name} account is connected and ready to send campaign emails.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto mb-6">
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Provider</span>
                <span className="text-emerald-900 font-semibold">{EMAIL_PROVIDERS.find(p => p.id === provider)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Domain</span>
                <span className="text-emerald-900 font-semibold">{domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Status</span>
                <span className="text-emerald-900 font-semibold">Active</span>
              </div>
            </div>
          </div>
          <button onClick={() => setWizardStep(0)}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Reconfigure
          </button>
        </div>
      )}
    </div>
  );
}

function HubSpotTab() {
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Integration Steps</h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">{step.effort}</span>
                </div>
                <p className="text-xs text-slate-600">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">HubSpot Setup Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-900">{item.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.scope}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FINRATab() {
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
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-amber-900 mb-1">Compliance is built into every layer of this platform.</p>
        <p className="text-sm text-amber-800">The education-only approach, supervisory review workflow, and automatic audit trail ensure FINRA compliance at every step. All marketing materials should still go through your firm&apos;s designated principal for review.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Built-in Safeguards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {safeguards.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Key FINRA Rules</h2>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{r.rule}</span>
                <span className="text-sm font-bold text-slate-900">{r.title}</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">{r.summary}</p>
              <p className="text-[11px] text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                <strong>Portal Impact:</strong> {r.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Technical Architecture</h2>
        <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300">
          <p className="text-slate-500">{'// Current MVP'}</p>
          <p className="text-emerald-400">Next.js App (Vercel) &rarr; Mock Data Layer &rarr; UI</p>
          <br />
          <p className="text-slate-500">{'// Production'}</p>
          <p className="text-blue-400">Next.js App (Vercel)</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u251c\u2500\u2500 API Routes &rarr; HubSpot Private App API</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u2502&nbsp;&nbsp;\u251c\u2500\u2500 /api/contacts &rarr; Contacts API</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u2502&nbsp;&nbsp;\u251c\u2500\u2500 /api/campaigns &rarr; Workflows + Email Events</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u2502&nbsp;&nbsp;\u251c\u2500\u2500 /api/pipeline &rarr; Deal Pipeline</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u2502&nbsp;&nbsp;\u2514\u2500\u2500 /api/activities &rarr; Engagements API</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u251c\u2500\u2500 Webhooks \u2190 HubSpot (real-time)</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u251c\u2500\u2500 NextAuth.js &rarr; SSO / Auth</p>
          <p className="text-slate-400">&nbsp;&nbsp;\u2514\u2500\u2500 Edge Functions &rarr; Intent Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Data Layer', desc: 'Mock data functions are designed as a swappable abstraction. Each call becomes an API route \u2014 zero UI changes needed.', bgColor: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1e40af' },
          { title: 'Authentication', desc: 'NextAuth.js with credentials for MVP, upgradeable to SSO for production. Role-based access per page.', bgColor: '#ecfdf5', borderColor: '#a7f3d0', textColor: '#065f46' },
          { title: 'Deployment', desc: 'Vercel handles hosting, SSL, CDN, auto-scaling. Push to GitHub = auto deploy. API keys stored in env vars.', bgColor: '#f5f3ff', borderColor: '#c4b5fd', textColor: '#5b21b6' },
        ].map(item => (
          <div key={item.title} className="rounded-xl p-4" style={{ backgroundColor: item.bgColor, borderColor: item.borderColor, borderWidth: 1, borderStyle: 'solid' }}>
            <p className="text-sm font-bold mb-1" style={{ color: item.textColor }}>{item.title}</p>
            <p className="text-xs text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapTab() {
  const phases = [
    { phase: '1', title: 'HubSpot Integration', status: 'Next Up', color: '#d97706', timeline: '2-3 weeks', items: ['API auth setup', 'Contact sync (500K)', 'Campaign mapping', 'Pipeline stage sync', 'Activity sync', 'Webhooks'] },
    { phase: '2', title: 'Governance Model', status: 'Phase 2', color: '#7c3aed', timeline: '1-2 weeks', items: ['Role-based access control', 'Lead routing rules', 'Audit trail & reporting'] },
    { phase: '3', title: 'Scale & Optimize', status: 'Future', color: '#64748b', timeline: 'Ongoing', items: ['ML intent scoring', 'A/B testing framework', 'Multi-channel expansion', 'ROI attribution dashboard'] },
  ];

  return (
    <div className="space-y-4">
      {phases.map(p => (
        <div key={p.phase} className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: p.color }}>
              {p.phase}
            </span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-400">{p.timeline}</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: p.color + '15', color: p.color }}>
              {p.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {p.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0" />
                <p className="text-xs text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
