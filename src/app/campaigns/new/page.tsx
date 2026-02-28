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

const STEPS = ['Campaign Info', 'Email Sequence', 'Review & Launch'];

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

  return (
    <div className="max-w-[900px]">
      <PageHeader
        title="Create New Campaign"
        subtitle="Build an automated drip email sequence"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'New Campaign' },
        ]}
      />

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-1 transition-all ${
              i === step ? 'bg-blue-600 text-white shadow-md' :
              i < step ? 'bg-emerald-100 text-emerald-700' :
              'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && <span className="text-slate-300">&rarr;</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Info */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., Insurance Review — Spring 2026"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Line</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SERVICE_LINES.map(sl => {
                const slCfg = SERVICE_LINE_CONFIG[sl];
                return (
                  <button key={sl} onClick={() => setServiceLine(sl)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      serviceLine === sl ? 'shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={serviceLine === sl ? { borderColor: slCfg.color, backgroundColor: slCfg.bgColor } : {}}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: slCfg.bgColor, color: slCfg.color }}>
                      <Icon name={slCfg.icon} className="w-4 h-4" />
                    </span>
                    <p className="text-xs font-semibold mt-1" style={serviceLine === sl ? { color: slCfg.color } : { color: '#334155' }}>{sl}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the campaign goal and target audience..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Clone from Existing (Optional)</label>
            <select value={cloneFrom} onChange={e => handleClone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Start from scratch</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {!canProceedStep1 && name.length === 0 && (
              <p className="text-xs text-amber-600">Enter a campaign name to continue</p>
            )}
            {!canProceedStep1 && name.length > 0 && (
              <p className="text-xs text-amber-600">Campaign name cannot be only whitespace</p>
            )}
            {canProceedStep1 && <div />}
            <button onClick={() => setStep(1)} disabled={!canProceedStep1}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Next: Email Sequence &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Email Sequence */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Live timeline preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">Drip Sequence Preview</p>
            <DripTimeline steps={emails} color={cfg.color} />
          </div>

          {emails.map((email, i) => {
            const isExpanded = expandedEmail === i;
            const isFilled = !!(email.subject && email.body);

            return (
              <div key={email.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                isExpanded ? 'border-blue-200 shadow-md' : 'border-slate-200'
              }`}>
                {/* Collapsible Header */}
                <button
                  onClick={() => setExpandedEmail(isExpanded ? -1 : i)}
                  className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: cfg.color }}>
                      {i + 1}
                    </span>
                    <div className="text-left">
                      <span className="text-sm font-bold text-slate-900">Email {i + 1}</span>
                      {email.subject && !isExpanded && (
                        <span className="text-xs text-slate-400 ml-2">&mdash; {email.subject}</span>
                      )}
                    </div>
                    {isFilled && !isExpanded && (
                      <Check className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-slate-400">Day</label>
                      <input type="number" min={1} max={90} value={email.sendDay}
                        onChange={e => updateEmail(i, 'sendDay', parseInt(e.target.value) || 1)}
                        className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Editor */}
                {isExpanded && (
                  <div className="p-5 space-y-3">
                    {serviceLineTemplates.length > 0 && (
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Import from Content Library</label>
                        <select onChange={e => { if (e.target.value) loadTemplate(i, e.target.value); }}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                      <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Subject Line</label>
                      <input type="text" value={email.subject} onChange={e => updateEmail(i, 'subject', e.target.value)}
                        placeholder="Enter email subject..."
                        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Preview Text</label>
                      <input type="text" value={email.previewText} onChange={e => updateEmail(i, 'previewText', e.target.value)}
                        placeholder="Short preview shown in inbox..."
                        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 block">Email Body</label>
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
                          className="text-[11px] text-blue-600 font-semibold inline-flex items-center gap-1 hover:text-blue-800 transition-colors">
                          <Eye className="w-3 h-3" /> {previewIndex === i ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        {previewIndex === i && (
                          <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden" style={{ height: '400px' }}>
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

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(0)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              &larr; Back
            </button>
            <div className="flex items-center gap-3">
              {!canProceedStep2 && (
                <p className="text-xs text-amber-600">Complete at least 1 email (subject + body)</p>
              )}
              <button onClick={() => setStep(2)} disabled={!canProceedStep2}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Next: Review &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Launch */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Campaign Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1" style={{ backgroundColor: cfg.color }} />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                  <Icon name={cfg.icon} className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{name || 'Untitled Campaign'}</h3>
                  <p className="text-sm text-slate-500">{serviceLine}</p>
                  {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">{filledEmails.length}</p>
                  <p className="text-[10px] text-slate-400">Emails</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">{emails[emails.length - 1]?.sendDay || 0}</p>
                  <p className="text-[10px] text-slate-400">Total Days</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">0</p>
                  <p className="text-[10px] text-slate-400">Enrolled</p>
                </div>
              </div>

              <DripTimeline steps={emails} color={cfg.color} />
            </div>
          </div>

          {/* Email Previews */}
          <div className="space-y-3">
            {emails.map((email, i) => (
              email.subject ? (
                <div key={email.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: cfg.color }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Day {email.sendDay}: {email.subject}</p>
                      <p className="text-xs text-slate-400">{email.previewText}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div
                      className="text-xs text-slate-600 leading-relaxed line-clamp-4 [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: email.bodyFormat === 'html' ? email.body : email.body.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                </div>
              ) : null
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              &larr; Back
            </button>
            <div className="flex gap-3">
              <button onClick={() => handleLaunch(true)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Save as Draft
              </button>
              <button onClick={() => handleLaunch(false)}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
