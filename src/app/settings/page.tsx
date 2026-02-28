'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePersistedState } from '@/lib/hooks/usePersistedState';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { Icon } from '@/components/ui/Icon';
import { Check, Mail, Settings, Server, RotateCcw, Download, AlertTriangle, Info, Zap } from 'lucide-react';

const tabs = ['Email & Data', 'HubSpot Integration', 'FINRA Compliance', 'Architecture', 'Roadmap'] as const;
type Tab = typeof tabs[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = usePersistedState<Tab>('ffa-settings-tab', 'Email & Data');

  return (
    <div className="max-w-[1000px]">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration, integration guides, and compliance documentation"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Email & Data' && <EmailDataTab />}
      {activeTab === 'HubSpot Integration' && <HubSpotTab />}
      {activeTab === 'FINRA Compliance' && <FINRATab />}
      {activeTab === 'Architecture' && <ArchitectureTab />}
      {activeTab === 'Roadmap' && <RoadmapTab />}
    </div>
  );
}

function EmailDataTab() {
  const { contacts, campaigns, activities, customTemplates, resetToDefaults } = usePortal();
  const { showToast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      contacts: contacts.length,
      campaigns,
      activities: activities.slice(0, 100), // last 100 activities
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
      {/* Simulation Mode Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900 mb-1">Simulation Mode</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              This portal is running in demo mode. Emails are <strong>not</strong> being sent — all campaign data, engagement metrics, and activity are simulated locally.
              When HubSpot is integrated, real emails will be sent through your connected provider.
            </p>
          </div>
        </div>
      </div>

      {/* What's Real vs Coming Soon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">What Works Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div key={i} className={`flex items-center gap-2 p-3 rounded-lg border ${
              item.live ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
            }`}>
              {item.live ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold flex-shrink-0">SOON</span>
              )}
              <p className={`text-xs ${item.live ? 'text-emerald-800' : 'text-slate-500'}`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Your Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Contacts', value: contacts.length, color: '#3b82f6' },
            { label: 'Campaigns', value: campaigns.length, color: '#7c3aed' },
            { label: 'Activities', value: activities.length, color: '#059669' },
            { label: 'Templates', value: customTemplates.length, color: '#d97706' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Export */}
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Data (JSON)
          </button>

          {/* Reset */}
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
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
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Provider Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Email Provider</h2>
        <p className="text-sm text-slate-500 mb-4">Real email sending requires a HubSpot integration. See the HubSpot Integration tab for setup details.</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Coming with HubSpot Integration</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
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
          <p className="text-slate-500">{'// Current MVP (with local persistence)'}</p>
          <p className="text-emerald-400">Next.js App (Vercel) &rarr; localStorage + IndexedDB &rarr; UI</p>
          <br />
          <p className="text-slate-500">{'// Production'}</p>
          <p className="text-blue-400">Next.js App (Vercel)</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── API Routes &rarr; HubSpot Private App API</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/contacts &rarr; Contacts API</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/campaigns &rarr; Workflows + Email Events</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/pipeline &rarr; Deal Pipeline</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;└── /api/activities &rarr; Engagements API</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── Webhooks ← HubSpot (real-time)</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── NextAuth.js &rarr; SSO / Auth</p>
          <p className="text-slate-400">&nbsp;&nbsp;└── Edge Functions &rarr; Intent Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Data Layer', desc: 'localStorage + IndexedDB for MVP. Each data call is swappable — when HubSpot connects, zero UI changes needed.', bgColor: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1e40af' },
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
