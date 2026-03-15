'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINES, SERVICE_LINE_CONFIG, type ServiceLine, type EmailStep, type Campaign } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DripTimeline } from '@/components/ui/DripTimeline';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { EmailPreview } from '@/components/ui/EmailPreview';
import { Icon } from '@/components/ui/Icon';
import { Check, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { getContentLibrary } from '@/lib/data';

function makeId() {
  return `camp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeStepId() {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const defaultEmails: EmailStep[] = [
  { id: makeStepId(), subject: '', previewText: '', body: '', bodyFormat: 'html', sendDay: 1, status: 'draft' },
  { id: makeStepId(), subject: '', previewText: '', body: '', bodyFormat: 'html', sendDay: 7, status: 'draft' },
  { id: makeStepId(), subject: '', previewText: '', body: '', bodyFormat: 'html', sendDay: 14, status: 'draft' },
  { id: makeStepId(), subject: '', previewText: '', body: '', bodyFormat: 'html', sendDay: 28, status: 'draft' },
];

export default function NewCampaignPageWrapper() {
  return (
    <Suspense>
      <NewCampaignPage />
    </Suspense>
  );
}

function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCampaign, campaigns } = usePortal();
  const { showToast } = useToast();
  const contentLibrary = getContentLibrary();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('Insurance Review');
  const [description, setDescription] = useState('');
  const [cloneFrom, setCloneFrom] = useState<string>('');
  const [emails, setEmails] = useState<EmailStep[]>(defaultEmails);
  const [expandedEmail, setExpandedEmail] = useState<number>(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Auto-fill from URL templateId param
  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (templateId) {
      const tmpl = contentLibrary.find(t => t.template.id === templateId);
      if (tmpl) {
        setServiceLine(tmpl.serviceLine);
        setEmails(prev => prev.map((e, i) =>
          i === 0 ? { ...e, subject: tmpl.template.subject, previewText: tmpl.template.previewText, body: tmpl.template.body, bodyFormat: tmpl.template.bodyFormat || 'text' } : e
        ));
        setStep(1);
        showToast(`Template "${tmpl.template.subject}" loaded into Email 1`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClone(campaignId: string) {
    setCloneFrom(campaignId);
    const source = campaigns.find(c => c.id === campaignId);
    if (source) {
      setServiceLine(source.serviceLine);
      setDescription(source.description);
      setEmails(source.emailSequence.map(e => ({ ...e, id: makeStepId(), status: 'draft' as const })));
    }
  }

  function loadTemplate(emailIndex: number, templateId: string) {
    const tmpl = contentLibrary.find(t => t.template.id === templateId);
    if (!tmpl) return;
    setEmails(prev => prev.map((e, i) =>
      i === emailIndex ? { ...e, subject: tmpl.template.subject, previewText: tmpl.template.previewText, body: tmpl.template.body, bodyFormat: tmpl.template.bodyFormat || 'text' } : e
    ));
  }

  function updateEmail(index: number, field: keyof EmailStep, value: string | number) {
    setEmails(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }

  function handleLaunch(asDraft: boolean) {
    const campaign: Campaign = {
      id: makeId(),
      name: name || `New ${serviceLine} Campaign`,
      serviceLine,
      description: description || `Automated drip campaign for ${serviceLine}`,
      status: asDraft ? 'draft' : 'active',
      emailSequence: emails.map(e => ({ ...e, status: asDraft ? 'draft' as const : 'active' as const })),
      enrolledCount: 0,
      openRate: 0,
      clickRate: 0,
      intentSignals: 0,
      createdAt: new Date().toISOString(),
    };
    addCampaign(campaign);
    showToast(`Campaign "${campaign.name}" ${asDraft ? 'saved as draft' : 'launched'}!`);
    router.push('/campaigns');
  }

  const cfg = SERVICE_LINE_CONFIG[serviceLine];
  const serviceLineTemplates = contentLibrary.filter(t => t.serviceLine === serviceLine);
  const filledEmails = emails.filter(e => e.subject && e.body);
  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = filledEmails.length >= 1;
  const canLaunch = canProceedStep1 && canProceedStep2;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHeader
        title="Create New Campaign"
        subtitle="Build an automated drip email sequence"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'New Campaign' },
        ]}
      />

      {/* Single Scrollable Form */}
      <div className="max-w-3xl space-y-8 pb-24">

        {/* Section 1: Campaign Details */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Campaign Details</h2>
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Insurance Review — Spring 2026"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {!canProceedStep1 && name.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">Campaign name cannot be only whitespace</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Service Line</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SERVICE_LINES.map(sl => {
                  const slCfg = SERVICE_LINE_CONFIG[sl];
                  return (
                    <button key={sl} onClick={() => setServiceLine(sl)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        serviceLine === sl ? 'shadow-sm' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={serviceLine === sl ? { borderColor: slCfg.color, backgroundColor: slCfg.bgColor } : {}}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: slCfg.bgColor, color: slCfg.color }}>
                        <Icon name={slCfg.icon} className="w-4 h-4" />
                      </span>
                      <p className="text-xs font-semibold mt-1" style={serviceLine === sl ? { color: slCfg.color } : { color: '#171717' }}>{sl}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the campaign goal and target audience..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Clone from Existing (Optional)</label>
              <select value={cloneFrom} onChange={e => handleClone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Start from scratch</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-neutral-100" />

        {/* Section 2: Email Sequence */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Email Sequence</h2>

          {/* Drip Timeline Preview */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-4">
            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-2">Drip Sequence Preview</p>
            <DripTimeline steps={emails} color={cfg.color} />
          </div>

          {/* Collapsible Email Editors */}
          <div className="space-y-3">
            {emails.map((email, i) => {
              const isExpanded = expandedEmail === i;
              const isFilled = !!(email.subject && email.body);

              return (
                <div key={email.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${
                  isExpanded ? 'border-indigo-200' : 'border-neutral-200'
                }`}>
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedEmail(isExpanded ? -1 : i)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: cfg.color }}>
                        {i + 1}
                      </span>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-neutral-900">Email {i + 1}</span>
                        {email.subject && !isExpanded && (
                          <span className="text-xs text-neutral-500 ml-2">&mdash; {email.subject}</span>
                        )}
                      </div>
                      {isFilled && !isExpanded && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <label className="text-xs text-neutral-400">Day</label>
                        <input type="number" min={1} max={90} value={email.sendDay}
                          onChange={e => updateEmail(i, 'sendDay', parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1 rounded-lg border border-neutral-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                    </div>
                  </button>

                  {/* Expanded Editor */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-neutral-100">
                      {serviceLineTemplates.length > 0 && (
                        <div>
                          <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Import from Content Library</label>
                          <select onChange={e => { if (e.target.value) loadTemplate(i, e.target.value); }}
                            className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Choose a template...</option>
                            {serviceLineTemplates.map(t => (
                              <option key={t.template.id} value={t.template.id}>
                                {t.campaignName} — Step {t.stepNumber}: {t.template.subject}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Subject Line</label>
                        <input type="text" value={email.subject} onChange={e => updateEmail(i, 'subject', e.target.value)}
                          placeholder="Enter email subject..."
                          className="w-full mt-1 px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Preview Text</label>
                        <input type="text" value={email.previewText} onChange={e => updateEmail(i, 'previewText', e.target.value)}
                          placeholder="Short preview shown in inbox..."
                          className="w-full mt-1 px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1 block">Email Body</label>
                        <RichTextEditor
                          initialContent={email.body}
                          onChange={(html) => updateEmail(i, 'body', html)}
                          placeholder="Start writing your email..."
                          minHeight="200px"
                        />
                      </div>

                      {/* Preview Toggle */}
                      {email.subject && email.body && (
                        <div>
                          <button onClick={() => setPreviewIndex(previewIndex === i ? null : i)}
                            className="text-[11px] text-indigo-600 font-semibold inline-flex items-center gap-1 hover:text-indigo-800 transition-colors">
                            <Eye className="w-3 h-3" /> {previewIndex === i ? 'Hide Preview' : 'Show Preview'}
                          </button>
                          {previewIndex === i && (
                            <div className="mt-2 rounded-xl border border-neutral-200 overflow-hidden" style={{ height: '400px' }}>
                              <EmailPreview
                                subject={email.subject}
                                previewText={email.previewText}
                                body={email.body}
                                bodyFormat={email.bodyFormat || 'text'}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!canProceedStep2 && filledEmails.length === 0 && (
            <p className="text-xs text-neutral-500 mt-3">Complete at least 1 email (subject + body) to launch.</p>
          )}
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {filledEmails.length} of {emails.length} emails completed
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleLaunch(true)}
              disabled={!canProceedStep1}
              className="px-5 py-2 border border-neutral-200 text-neutral-600 text-sm font-semibold rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Save as Draft
            </button>
            <button onClick={() => handleLaunch(false)}
              disabled={!canLaunch}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Launch Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
