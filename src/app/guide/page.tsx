import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';

const steps = [
  {
    number: 1,
    title: 'Segment Your Audience',
    description: 'Start by reviewing your contacts. The Audience page shows them organized by where they are in the outreach lifecycle. Focus on the Dormant segment — these are contacts who haven\'t heard from you in a while and are prime candidates for re-engagement.',
    href: '/audience',
    cta: 'Go to Audience',
    iconName: 'users',
    color: '#2563eb',
  },
  {
    number: 2,
    title: 'Browse Email Templates',
    description: 'The Content Library has 20 pre-written email templates across 5 service lines (Insurance, Annuities, Retirement, Investment, and Second Opinion). Each template is education-only and compliance-safe. Preview them and choose which ones fit your contacts.',
    href: '/content',
    cta: 'Browse Templates',
    iconName: 'mail',
    color: '#7c3aed',
  },
  {
    number: 3,
    title: 'Launch Drip Campaigns',
    description: 'Each campaign is a 4-email automated sequence sent over 14 days. Enroll your dormant contacts and the system handles the rest — sending emails on schedule, tracking opens, clicks, and replies. No manual work required.',
    href: '/campaigns',
    cta: 'View Campaigns',
    iconName: 'rocket',
    color: '#059669',
  },
  {
    number: 4,
    title: 'Engage Warm Leads',
    description: 'When a contact opens, clicks, or replies to your emails, they become a "warm lead" and appear on the Warm Leads page. This is where automation stops and the advisor steps in. Assign a rep, schedule a call, or send a personal follow-up.',
    href: '/warm-leads',
    cta: 'Check Warm Leads',
    iconName: 'handshake',
    color: '#d97706',
  },
];

const flowStages = [
  { label: 'Dormant Contacts', sub: '~500K leads sitting idle', color: '#64748b', iconName: 'moon' },
  { label: 'Drip Campaign', sub: '4-email automated sequence', color: '#2563eb', iconName: 'mail' },
  { label: 'Contact Responds', sub: 'Opens, clicks, or replies', color: '#d97706', iconName: 'flame' },
  { label: 'Advisor Handoff', sub: 'Personal follow-up begins', color: '#7c3aed', iconName: 'handshake' },
  { label: 'Meeting Booked', sub: 'Revenue opportunity created', color: '#059669', iconName: 'calendar' },
];

const faqs = [
  {
    q: 'What happens after I enroll a contact in a campaign?',
    a: 'The system automatically sends the 4-email sequence over 14 days. Email 1 goes out immediately, Email 2 on Day 3, Email 3 around Day 7, and Email 4 on Day 14. You don\'t need to do anything — it\'s fully automated.',
  },
  {
    q: 'How does the intent score work?',
    a: 'The intent score (0-100) measures how engaged a contact is based on their activity. Opening an email adds a few points, clicking a link adds more, replying adds the most. Higher scores mean the contact is more likely to convert. Scores above 50 are considered "hot."',
  },
  {
    q: 'What if a contact unsubscribes?',
    a: 'HubSpot automatically manages unsubscribe requests. The contact is removed from all active campaigns and added to a suppression list. They will never be re-enrolled. This is handled automatically to comply with CAN-SPAM.',
  },
  {
    q: 'How do I know when to personally reach out?',
    a: 'Check the Warm Leads page. Any contact who replies, requests information, or shows repeated engagement will appear there with a priority tier. The "Replied" tier is the hottest — these contacts are actively interested and should be contacted first.',
  },
  {
    q: 'Are the email templates FINRA compliant?',
    a: 'All templates are designed to be education-only — no specific product recommendations, no performance guarantees, no personalized advice. However, all marketing materials should still go through your firm\'s compliance review before going live. The Roadmap page covers FINRA compliance requirements in detail.',
  },
  {
    q: 'Can I create my own email templates?',
    a: 'Yes! Use the Content Library\'s "Create Template" button to build custom templates. You can add personalization tokens like {{first_name}} and {{company}} that auto-fill for each contact. When connected to HubSpot, templates will sync automatically.',
  },
  {
    q: 'What are the 5 service lines?',
    a: 'Insurance Review (coverage gap analysis), Under-Serviced Annuities (fee and performance review), Retirement Planning (readiness assessment), Investment Planning (portfolio analysis), and Second-Opinion Positioning (financial health check from a new perspective).',
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-[900px]">
      <PageHeader
        title="How It Works"
        subtitle="A complete walkthrough of The Advantage platform"
      />

      {/* Big Picture Flow */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">The Big Picture</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {flowStages.map((stage, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center text-center min-w-[130px]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: stage.color + '15' }}>
                  <Icon name={stage.iconName} className="w-6 h-6" style={{ color: stage.color }} />
                </div>
                <p className="text-xs font-bold text-slate-900">{stage.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stage.sub}</p>
              </div>
              {i < 4 && (
                <div className="flex-shrink-0 mx-1">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Step-by-Step Guide</h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.number} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-start gap-5 p-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: step.color }}>
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-6 mt-2" style={{ backgroundColor: step.color + '30' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: step.color + '15' }}>
                      <Icon name={step.iconName} className="w-4 h-4" style={{ color: step.color }} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.description}</p>
                  <Link href={step.href}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: step.color }}>
                    {step.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to get started?</h3>
        <p className="text-sm text-slate-600 mb-4">Begin by reviewing your audience segments, then explore the email templates.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/audience" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            View Your Audience
          </Link>
          <Link href="/content" className="px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
