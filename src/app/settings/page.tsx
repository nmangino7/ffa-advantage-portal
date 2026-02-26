'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';

const tabs = ['HubSpot Integration', 'FINRA Compliance', 'Architecture', 'Roadmap'] as const;
type Tab = typeof tabs[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('HubSpot Integration');

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
      {activeTab === 'HubSpot Integration' && <HubSpotTab />}
      {activeTab === 'FINRA Compliance' && <FINRATab />}
      {activeTab === 'Architecture' && <ArchitectureTab />}
      {activeTab === 'Roadmap' && <RoadmapTab />}
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
    { label: 'Set up Deal Pipeline with 5 custom stages', scope: 'Dormant → Education → Intent → Qualified → Licensed Rep' },
    { label: 'Create custom Contact Properties', scope: 'intent_score (number), portal_stage (dropdown)' },
    { label: 'Configure 20 Marketing Email Templates', scope: '5 service lines x 4 emails each' },
    { label: 'Set up Enrollment Workflows', scope: 'Trigger: contact property change → enroll in sequence' },
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
    'All email sequences are education-only — no specific product recommendations',
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
              <span className="text-emerald-600 text-sm flex-shrink-0">✓</span>
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
          <p className="text-emerald-400">Next.js App (Vercel) → Mock Data Layer → UI</p>
          <br />
          <p className="text-slate-500">{'// Production'}</p>
          <p className="text-blue-400">Next.js App (Vercel)</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── API Routes → HubSpot Private App API</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/contacts → Contacts API</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/campaigns → Workflows + Email Events</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;├── /api/pipeline → Deal Pipeline</p>
          <p className="text-slate-400">&nbsp;&nbsp;│&nbsp;&nbsp;└── /api/activities → Engagements API</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── Webhooks ← HubSpot (real-time)</p>
          <p className="text-slate-400">&nbsp;&nbsp;├── NextAuth.js → SSO / Auth</p>
          <p className="text-slate-400">&nbsp;&nbsp;└── Edge Functions → Intent Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Data Layer', desc: 'Mock data functions are designed as a swappable abstraction. Each call becomes an API route — zero UI changes needed.', color: 'blue' },
          { title: 'Authentication', desc: 'NextAuth.js with credentials for MVP, upgradeable to SSO for production. Role-based access per page.', color: 'emerald' },
          { title: 'Deployment', desc: 'Vercel handles hosting, SSL, CDN, auto-scaling. Push to GitHub = auto deploy. API keys stored in env vars.', color: 'violet' },
        ].map(item => (
          <div key={item.title} className={`bg-${item.color}-50 border border-${item.color}-100 rounded-xl p-4`}>
            <p className="text-sm font-bold mb-1" style={{ color: `var(--${item.color}-900, #1e293b)` }}>{item.title}</p>
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
