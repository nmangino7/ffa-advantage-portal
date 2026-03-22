'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { ChevronDown } from 'lucide-react';

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-up">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-neutral-900">How It Works</h1>
        <p className="text-sm text-neutral-500 mt-1">A complete walkthrough of The Advantage platform</p>
      </div>

      {/* Big Picture Flow */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">The Big Picture</h2>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {flowStages.map((stage, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center text-center min-w-[130px]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: stage.color + '15' }}>
                    <Icon name={stage.iconName} className="w-6 h-6" style={{ color: stage.color }} />
                  </div>
                  <p className="text-xs font-semibold text-neutral-900">{stage.label}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{stage.sub}</p>
                </div>
                {i < 4 && (
                  <div className="flex-shrink-0 mx-1">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">Step-by-Step Guide</h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.number} className="bg-white rounded-xl border border-neutral-200 overflow-hidden card-hover-premium">
              <div className="flex items-start gap-5 p-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`, boxShadow: `0 4px 14px ${step.color}30` }}>
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-8 mt-2 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${step.color}60, ${step.color}10)` }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: step.color + '15' }}>
                      <Icon name={step.iconName} className="w-4 h-4" style={{ color: step.color }} />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{step.description}</p>
                  <Link href={step.href}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
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
      </section>

      {/* FAQ Accordion */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-all duration-300"
              >
                <span className="text-sm font-semibold text-neutral-900 pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 animate-fade-up">
                  <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Non-Pushy Follow-Up Playbook ─── */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">The Non-Pushy Follow-Up Playbook</h2>
            <p className="text-sm text-neutral-500">Research-backed strategies for financial advisor outreach</p>
          </div>
        </div>

        {/* 7 Principles */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">7 Principles of Non-Pushy Client Engagement</h3>
          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Lead with Value, Not the Ask',
                detail: 'Every touchpoint should give something before asking for anything. Share a relevant article, a market insight, or a useful tool. When prospects associate you with value, they come to you.',
                example: '"I came across this article about changes to Florida insurance regulations that might affect your coverage. Thought of you — worth a quick read."',
                color: 'from-blue-500 to-blue-600',
              },
              {
                num: '2',
                title: 'The 3-3-3 Rule',
                detail: '3 touchpoints, 3 different channels, 3 different angles. Don\'t send the same message 3 times. Email #1: educational content. Email #2: a client success story (anonymized). Email #3: a specific, time-limited offer (free review). Each adds new value.',
                example: 'Touch 1: "Here\'s what\'s changing with annuity rates." Touch 2: "A client in a similar situation saved $2,400/year." Touch 3: "We have 5 complimentary review slots open this month."',
                color: 'from-violet-500 to-violet-600',
              },
              {
                num: '3',
                title: 'Acknowledge the Silence Gracefully',
                detail: 'If someone hasn\'t responded after 2-3 emails, don\'t pretend it hasn\'t happened. Acknowledge it directly: "I know you\'re busy" or "I want to respect your time." This builds trust because it shows self-awareness.',
                example: '"I\'ve sent a couple of emails and understand you might be busy. I\'ll keep sharing useful content, but there\'s zero pressure to respond. When the timing is right, I\'m here."',
                color: 'from-amber-500 to-amber-600',
              },
              {
                num: '4',
                title: 'Use Social Proof, Not Pressure',
                detail: 'Instead of "you need this," share what others in similar situations have done. "Many of our clients in Tampa have found value in reviewing their coverage after 3+ years." This lets prospects self-identify without feeling targeted.',
                example: '"Last quarter, 23 families in the Tampa Bay area updated their retirement plans after discovering gaps. Most hadn\'t reviewed their plans in over 5 years."',
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                num: '5',
                title: 'Ask Permission to Follow Up',
                detail: 'The most powerful non-pushy technique: ask if they want to hear from you. "Would it be helpful if I sent you occasional updates on retirement planning strategies?" A "yes" transforms cold outreach into requested communication.',
                example: '"Would you find it helpful if I sent you a brief monthly market update relevant to your insurance coverage? Just reply \'yes\' and I\'ll add you to our educational newsletter."',
                color: 'from-rose-500 to-rose-600',
              },
              {
                num: '6',
                title: 'Provide an Easy Exit',
                detail: 'Always give prospects an easy way to say "no" or "not now." When people feel trapped, they ghost. When they feel free to leave, they\'re more likely to stay. "If this isn\'t relevant to you, just let me know and I\'ll stop reaching out."',
                example: '"If reviewing your coverage isn\'t a priority right now, I completely understand. Just reply \'not now\' and I\'ll circle back in 6 months, or \'stop\' and I\'ll remove you from future emails."',
                color: 'from-indigo-500 to-indigo-600',
              },
              {
                num: '7',
                title: 'The "Warm Lead Handoff" — Be Human',
                detail: 'When a contact replies or clicks, the worst thing you can do is immediately pitch. Instead, thank them, ask a question, and listen. "Thanks for reaching out! Before we dive in, I\'d love to understand your current situation. What prompted you to look into this?"',
                example: 'Prospect replies: "I\'m interested in the insurance review."\nAdvisor: "Great to hear from you, [Name]! Before we schedule anything, I\'d love to learn a bit about your current coverage and what\'s been on your mind. What prompted you to explore this?"',
                color: 'from-cyan-500 to-cyan-600',
              },
            ].map(p => (
              <div key={p.num} className="rounded-xl border border-neutral-100 overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-neutral-50">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${p.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
                    {p.num}
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900">{p.title}</h4>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-neutral-600 leading-relaxed">{p.detail}</p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">Example Script</p>
                    <p className="text-xs text-indigo-800 leading-relaxed whitespace-pre-line">{p.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Say After Silence */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">What to Say After Silence</h3>
          <p className="text-sm text-neutral-500 mb-4">When a prospect goes quiet after initial engagement, use these research-backed re-engagement approaches:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'The Value Recap', script: '"Hi [Name], I wanted to share something that reminded me of our earlier conversation — [specific insight or article]. No need to respond, just thought you\'d find it useful."', when: '2 weeks after last contact' },
              { title: 'The Honest Check-in', script: '"Hi [Name], I wanted to be upfront — I noticed we haven\'t connected in a while. I don\'t want to be a nuisance, so just let me know if you\'d prefer I reach out less frequently."', when: '4 weeks after last contact' },
              { title: 'The Trigger Event', script: '"Hi [Name], with [relevant market event/regulation change], I thought this might be a good time to revisit our earlier discussion about your coverage. Would a quick 10-minute call be helpful?"', when: 'When something relevant happens' },
              { title: 'The Graceful Close', script: '"Hi [Name], I\'ve enjoyed sharing financial insights with you. If your priorities have changed, I completely understand — just let me know and I\'ll stop reaching out. Either way, I wish you all the best."', when: '6+ weeks, final follow-up' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl bg-neutral-50 border border-neutral-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900">{item.title}</h4>
                  <span className="text-[9px] font-medium text-neutral-400 bg-white px-2 py-0.5 rounded-full border border-neutral-100">{item.when}</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed italic">{item.script}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warm Lead Handoff Scripts */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Warm Lead Handoff Scripts</h3>
          <p className="text-sm text-neutral-500 mb-4">When a contact moves from automated campaign to personal advisor outreach:</p>
          <div className="space-y-3">
            {[
              { trigger: 'Contact replied to an email', script: 'Hi [Name], thanks so much for getting back to me! I\'d love to learn more about what prompted your interest. Would you be open to a brief 15-minute call this week? I\'ll focus on listening to your situation — no pitch, just understanding where you are.' },
              { trigger: 'Contact requested information', script: 'Hi [Name], I saw you requested more information about [topic]. I\'ve attached a brief overview that covers the key points. After you\'ve had a chance to review it, I\'d be happy to answer any questions over a quick call — completely on your schedule.' },
              { trigger: 'Contact clicked multiple emails', script: 'Hi [Name], I noticed you\'ve been reading our educational emails about [service line] — great topics! Many people at this stage find a complimentary review helpful to see where they stand. Would that be useful for you? No obligation either way.' },
              { trigger: 'Contact booked an appointment', script: 'Hi [Name], looking forward to our conversation on [date]! To make the most of our time together, it would be helpful if you could have a rough idea of your current [coverage/portfolio/plan] details. But don\'t stress about preparation — I\'m here to help guide the conversation.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-neutral-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Trigger: {item.trigger}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">{item.script}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to get started?</h3>
        <p className="text-sm text-neutral-600 mb-4">Begin by reviewing your audience segments, then explore the email templates.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/audience" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
            View Your Audience
          </Link>
          <Link href="/content" className="px-5 py-2.5 bg-white text-neutral-700 text-sm font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 hover:shadow-sm">
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
