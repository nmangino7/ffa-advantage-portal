import Link from 'next/link';

export default function RoadmapPage() {
  return (
    <div className="max-w-[1000px]">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Implementation Roadmap</h1>
        <p className="text-slate-500 mt-1 text-[15px]">From MVP to production — HubSpot integration &amp; FINRA compliance guide</p>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">🚀</div>
          <div>
            <h2 className="text-xl font-bold mb-1">You Are Here: MVP Phase</h2>
            <p className="text-blue-100 text-sm">This portal is running on mock data to demonstrate the full vision. Below is the roadmap to connect it to your live HubSpot CRM and ensure FINRA compliance at every step.</p>
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="space-y-6 mb-10">
        <PhaseCard
          phase="1"
          title="HubSpot CRM Integration"
          status="Next Up"
          statusColor="bg-amber-100 text-amber-700"
          icon="🔗"
          timeline="2-3 weeks"
          description="Connect this portal to your live HubSpot data so all contacts, campaigns, and engagement metrics flow in real-time."
          steps={[
            {
              title: 'HubSpot API Authentication',
              detail: 'Set up a HubSpot Private App with scoped permissions. This gives us a secure API key that can read contacts, deals, and marketing emails without exposing your full account.',
              effort: '1 day',
            },
            {
              title: 'Contact Sync',
              detail: 'Replace the mock getContacts() data layer with HubSpot Contacts API calls. Map HubSpot contact properties (first name, last name, email, phone, company) to our Contact type. Sync the ~500K dormant contacts with pagination.',
              effort: '3-4 days',
            },
            {
              title: 'Campaign / Email Sequence Mapping',
              detail: 'Map HubSpot Marketing Email sequences or Workflows to our Campaign model. Each service line campaign becomes a HubSpot Workflow with enrollment triggers. Track email sends, opens, clicks, and replies through HubSpot Email Events API.',
              effort: '3-4 days',
            },
            {
              title: 'Pipeline Stage Mapping',
              detail: 'Create a HubSpot Deal Pipeline with 5 stages matching our lifecycle: Dormant → Education → Intent Signal → Qualified → Licensed Rep. When a contact advances in the portal, the HubSpot deal stage updates automatically.',
              effort: '2 days',
            },
            {
              title: 'Activity & Engagement Sync',
              detail: 'Pull engagement timeline from HubSpot Engagements API (emails, meetings, calls, notes). Calculate intent scores based on real engagement data instead of mock scores.',
              effort: '2-3 days',
            },
            {
              title: 'Webhook Setup for Real-Time Updates',
              detail: 'Configure HubSpot webhooks to push contact updates, email events, and deal stage changes to our portal in real-time, rather than polling the API.',
              effort: '1-2 days',
            },
          ]}
        />

        <PhaseCard
          phase="2"
          title="FINRA Compliance Framework"
          status="Critical"
          statusColor="bg-red-100 text-red-700"
          icon="⚖️"
          timeline="Ongoing"
          description="As a financial services firm, all marketing outreach must comply with FINRA Rules 2210 (Communications with the Public) and 2111 (Suitability). Here's how we build compliance into every layer."
          steps={[
            {
              title: 'Education-Only Content Guardrails',
              detail: 'All email sequences must be educational in nature — no specific product recommendations, no performance guarantees, no personalized advice. Every email template goes through compliance review before activation. The portal enforces this by requiring a "compliance approved" flag on each email step.',
              effort: 'Policy + Review',
            },
            {
              title: 'FINRA Rule 2210 — Communications Compliance',
              detail: 'All outreach materials (emails, landing pages) must include: (1) firm name and contact info, (2) clear identification as marketing material, (3) no misleading claims about returns or performance, (4) balanced presentation of risks and benefits, (5) no testimonials without proper disclosures. We build template validators that flag non-compliant content.',
              effort: 'Template Review',
            },
            {
              title: 'Suitability & Know Your Customer',
              detail: 'Before a contact advances from "Intent Signal" to "Qualified," a licensed service associate must review the contact\'s profile to ensure the service line is suitable. The portal tracks this handoff — no contact reaches a licensed rep without associate approval.',
              effort: 'Workflow Design',
            },
            {
              title: 'Opt-Out & CAN-SPAM Compliance',
              detail: 'Every email includes a one-click unsubscribe. HubSpot handles suppression list management automatically. The portal respects opt-outs and never re-enrolls a suppressed contact. We also respect state-level do-not-contact lists.',
              effort: 'Built into HubSpot',
            },
            {
              title: 'Recordkeeping (FINRA Rule 4511)',
              detail: 'All communications must be retained for at least 3 years. HubSpot\'s email logging plus our activity timeline creates a complete audit trail. Export capabilities allow compliance officers to pull all communications for any contact on demand.',
              effort: 'Automatic',
            },
            {
              title: 'Supervisory Review (FINRA Rule 3110)',
              detail: 'A designated principal must review and approve all marketing materials before use. The portal implements an approval workflow: draft → compliance review → principal approval → active. No email goes live without sign-off.',
              effort: 'Approval Workflow',
            },
          ]}
        />

        <PhaseCard
          phase="3"
          title="Governance Model Implementation"
          status="Phase 3"
          statusColor="bg-purple-100 text-purple-700"
          icon="🏛️"
          timeline="1-2 weeks"
          description="Implement the three-tier governance model from the deck: Marketing (top of funnel), Operations (middle), and Advice (licensed reps only)."
          steps={[
            {
              title: 'Role-Based Access Control',
              detail: 'Marketing team can manage campaigns and view aggregate metrics. Service associates (Operations) can view individual contacts and qualify leads. Licensed reps can only see contacts assigned to them. Compliance officers have full audit access.',
              effort: '3-4 days',
            },
            {
              title: 'Lead Routing Rules',
              detail: 'When a contact shows intent (click, reply, info request), the system automatically assigns them to a service associate based on service line and geography. Associates qualify leads and route to the appropriate licensed rep.',
              effort: '2-3 days',
            },
            {
              title: 'Audit Trail & Reporting',
              detail: 'Every stage transition, email send, and rep assignment is logged with timestamp and user. Weekly compliance reports show: emails sent, opt-out rate, stage transitions, and any flagged content.',
              effort: '2 days',
            },
          ]}
        />

        <PhaseCard
          phase="4"
          title="Scale & Optimize"
          status="Future"
          statusColor="bg-slate-100 text-slate-500"
          icon="📈"
          timeline="Ongoing"
          description="Once the foundation is solid, optimize for conversion and scale across all service lines."
          steps={[
            {
              title: 'Intent Score ML Model',
              detail: 'Replace the rule-based intent scoring with a machine learning model trained on actual conversion data. Which engagement patterns actually predict appointments? Use this to prioritize the hottest leads.',
              effort: '2-4 weeks',
            },
            {
              title: 'A/B Testing Framework',
              detail: 'Test different email subject lines, send times, and sequence lengths. HubSpot supports A/B testing natively — we surface the results in the campaign detail view.',
              effort: '1 week',
            },
            {
              title: 'Multi-Channel Expansion',
              detail: 'Add direct mail, SMS (with proper consent), and LinkedIn touchpoints to the outreach sequences. Each channel gets its own engagement tracking in the pipeline.',
              effort: '3-4 weeks',
            },
            {
              title: 'ROI Attribution Dashboard',
              detail: 'Track the full funnel from dormant contact to closed business. Calculate cost-per-appointment and revenue-per-campaign to prove ROI to leadership.',
              effort: '2 weeks',
            },
          ]}
        />
      </div>

      {/* Technical Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">🏗️ Technical Architecture</h2>
        <div className="bg-slate-50 rounded-xl p-6 font-mono text-sm text-slate-700">
          <div className="space-y-3">
            <p className="text-slate-400">{'// Current MVP Architecture'}</p>
            <p>Next.js App (Vercel) → Mock Data Layer → UI Components</p>
            <br />
            <p className="text-slate-400">{'// Production Architecture'}</p>
            <p>Next.js App (Vercel)</p>
            <p>&nbsp;&nbsp;├── API Routes → HubSpot Private App API</p>
            <p>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── /api/contacts → HubSpot Contacts API</p>
            <p>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── /api/campaigns → HubSpot Workflows + Email Events</p>
            <p>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── /api/pipeline → HubSpot Deal Pipeline</p>
            <p>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── /api/activities → HubSpot Engagements API</p>
            <p>&nbsp;&nbsp;├── Webhooks ← HubSpot (real-time updates)</p>
            <p>&nbsp;&nbsp;├── NextAuth.js → SSO / Team Authentication</p>
            <p>&nbsp;&nbsp;└── Vercel Edge Functions → Intent Score Computation</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-sm font-bold text-blue-900 mb-1">Data Layer</p>
            <p className="text-xs text-blue-700">The mock data functions (getContacts, getCampaigns, etc.) are designed as a swappable abstraction. Each function call becomes an API route that hits HubSpot — zero UI changes needed.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900 mb-1">Authentication</p>
            <p className="text-xs text-emerald-700">NextAuth.js with simple credentials for MVP, upgradeable to SSO (Okta, Azure AD) for production. Role-based access controls which pages and data each user type can see.</p>
          </div>
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
            <p className="text-sm font-bold text-violet-900 mb-1">Deployment</p>
            <p className="text-xs text-violet-700">Vercel handles hosting, SSL, CDN, and auto-scaling. Push to GitHub and it deploys automatically. Environment variables store HubSpot API keys securely.</p>
          </div>
        </div>
      </div>

      {/* HubSpot Setup Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">✅ HubSpot Setup Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CheckItem label="Create HubSpot Private App with required scopes" scope="crm.objects.contacts.read, crm.objects.deals.write, marketing-emails, etc." />
          <CheckItem label="Set up Deal Pipeline with 5 custom stages" scope="Dormant → Education → Intent → Qualified → Licensed Rep" />
          <CheckItem label="Create Contact Properties for intent score" scope="Custom property: intent_score (number), portal_stage (dropdown)" />
          <CheckItem label="Configure Marketing Email Templates" scope="5 service line campaigns × 4 emails each = 20 templates" />
          <CheckItem label="Set up HubSpot Workflows for auto-enrollment" scope="Trigger: contact property change → enroll in sequence" />
          <CheckItem label="Configure Webhook Subscriptions" scope="Contact updates, email events, deal stage changes" />
          <CheckItem label="Import existing contact database" scope="~500K dormant contacts with proper field mapping" />
          <CheckItem label="Set up suppression lists" scope="Opt-outs, do-not-contact, bounces" />
          <CheckItem label="Configure FINRA compliance properties" scope="compliance_approved (bool), reviewed_by (text), review_date" />
          <CheckItem label="Create Reports & Dashboards in HubSpot" scope="Backup reporting alongside the portal for compliance" />
        </div>
      </div>

      {/* Key FINRA Rules Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">📖 Key FINRA Rules Reference</h2>
        <div className="space-y-4">
          <RuleCard
            rule="Rule 2210"
            title="Communications with the Public"
            summary="All firm communications must be fair, balanced, and not misleading. Requires clear identification of the firm, balanced presentation of risks/benefits, and no guarantees of future performance."
            impact="Every email template must be reviewed for compliance before going live in the portal."
          />
          <RuleCard
            rule="Rule 2111"
            title="Suitability"
            summary="Firms must have a reasonable basis for recommending products. Since our outreach is education-only, we avoid suitability triggers — but the moment a contact shows intent, a licensed associate must evaluate appropriateness."
            impact="The Qualified stage in our pipeline is the compliance checkpoint where suitability is assessed."
          />
          <RuleCard
            rule="Rule 3110"
            title="Supervision"
            summary="Firms must establish and maintain a system to supervise activities of each associated person. A designated supervisor must review all communications."
            impact="Campaign approval workflow requires principal sign-off before any email goes active."
          />
          <RuleCard
            rule="Rule 4511"
            title="General Requirements for Books and Records"
            summary="Firms must make and preserve books, accounts, records, memoranda, and correspondence for at least 3 years (6 years for some records)."
            impact="Activity timeline + HubSpot logging creates the required audit trail automatically."
          />
          <RuleCard
            rule="CAN-SPAM Act"
            title="Email Marketing Compliance"
            summary="Commercial emails must include sender identification, physical address, clear opt-out mechanism, and honor opt-outs within 10 business days."
            impact="HubSpot handles suppression management. Portal never re-enrolls opted-out contacts."
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 text-center mb-8">
        <p className="text-lg font-bold text-slate-900 mb-2">Ready to move forward?</p>
        <p className="text-sm text-slate-500 mb-4">The mock data portal demonstrates the full vision. Phase 1 (HubSpot integration) can begin immediately with your HubSpot admin credentials.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ phase, title, status, statusColor, icon, timeline, description, steps }: {
  phase: string; title: string; status: string; statusColor: string; icon: string; timeline: string; description: string;
  steps: { title: string; detail: string; effort: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phase {phase}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor}`}>{status}</span>
              <span className="text-[10px] text-slate-400 ml-auto">⏱ {timeline}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-semibold text-slate-900">{step.title}</p>
                  <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100 font-medium">{step.effort}</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, scope }: { label: string; scope: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[10px] text-slate-300">○</span>
      </div>
      <div>
        <p className="text-[13px] font-medium text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{scope}</p>
      </div>
    </div>
  );
}

function RuleCard({ rule, title, summary, impact }: { rule: string; title: string; summary: string; impact: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{rule}</span>
        <span className="text-[13px] font-bold text-slate-900">{title}</span>
      </div>
      <p className="text-[12px] text-slate-600 mb-2">{summary}</p>
      <p className="text-[11px] text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
        <strong>Portal Impact:</strong> {impact}
      </p>
    </div>
  );
}
