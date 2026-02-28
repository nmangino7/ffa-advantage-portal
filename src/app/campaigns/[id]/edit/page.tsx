'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINES, SERVICE_LINE_CONFIG, type ServiceLine, type EmailStep } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DripTimeline } from '@/components/ui/DripTimeline';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Icon } from '@/components/ui/Icon';
import { Check, ChevronDown, ChevronUp, Save } from 'lucide-react';

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { campaigns, updateCampaign } = usePortal();
  const { showToast } = useToast();

  const campaign = campaigns.find(c => c.id === id);

  const [name, setName] = useState(campaign?.name || '');
  const [serviceLine, setServiceLine] = useState<ServiceLine>(campaign?.serviceLine || 'Insurance Review');
  const [description, setDescription] = useState(campaign?.description || '');
  const [emails, setEmails] = useState<EmailStep[]>(campaign?.emailSequence || []);
  const [expandedEmail, setExpandedEmail] = useState<number>(0);

  if (!campaign) {
    return (
      <div className="max-w-[900px]">
        <PageHeader title="Campaign Not Found" subtitle="This campaign doesn't exist." />
      </div>
    );
  }

  function updateEmail(index: number, field: keyof EmailStep, value: string | number) {
    setEmails(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }

  function handleSave() {
    updateCampaign(id, {
      name: name.trim() || campaign!.name,
      serviceLine,
      description: description.trim(),
      emailSequence: emails,
    });
    showToast(`Campaign "${name}" updated successfully`);
    router.push(`/campaigns/${id}`);
  }

  const cfg = SERVICE_LINE_CONFIG[serviceLine];
  const filledEmails = emails.filter(e => e.subject && e.body);

  return (
    <div className="max-w-[900px]">
      <PageHeader
        title={`Edit: ${campaign.name}`}
        subtitle="Modify campaign details and email sequence"
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name, href: `/campaigns/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Campaign Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
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
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      {/* Email Sequence */}
      <div className="space-y-4 mb-6">
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
              <button
                onClick={() => setExpandedEmail(isExpanded ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: cfg.color }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-900">Email {i + 1}</span>
                  {email.subject && !isExpanded && <span className="text-xs text-slate-400 ml-2">&mdash; {email.subject}</span>}
                  {isFilled && !isExpanded && <Check className="w-4 h-4 text-emerald-500" />}
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

              {isExpanded && (
                <div className="p-5 space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Subject Line</label>
                    <input type="text" value={email.subject} onChange={e => updateEmail(i, 'subject', e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Preview Text</label>
                    <input type="text" value={email.previewText} onChange={e => updateEmail(i, 'previewText', e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 block">Email Body</label>
                    <RichTextEditor
                      initialContent={email.body}
                      onChange={(html) => updateEmail(i, 'body', html)}
                      placeholder="Write the email body..."
                      minHeight="200px"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button onClick={() => router.push(`/campaigns/${id}`)}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          &larr; Cancel
        </button>
        <button onClick={handleSave} disabled={!name.trim() || filledEmails.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 shadow-md">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
