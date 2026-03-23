'use client';

import { useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { useModal } from '@/lib/context/ModalContext';
import { useToast } from '@/lib/context/ToastContext';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PDF_COMPANIONS } from '@/lib/data/pdf-companions';
import { PageHeader } from '@/components/ui/PageHeader';
import { DripTimeline } from '@/components/ui/DripTimeline';
import { Icon } from '@/components/ui/Icon';
import { Flame, Pencil, Send, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { contacts, campaigns, activities, toggleCampaignStatus } = usePortal();
  const { openEnrollModal, openConfirmDialog, openSendTestModal } = useModal();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'sequence' | 'contacts'>('overview');
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return <div className="p-10 text-center text-neutral-400">Campaign not found</div>;

  const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
  const campContacts = contacts.filter(c => c.campaigns.includes(id));

  const detailed = useMemo(() => {
    const campActivities = activities.filter(a => a.campaignId === id);
    const sent = campActivities.filter(a => a.type === 'email_sent').length;
    const opened = campActivities.filter(a => a.type === 'email_opened').length;
    const clicked = campActivities.filter(a => a.type === 'email_clicked').length;
    const replied = campActivities.filter(a => a.type === 'reply_received').length;
    const requested = campActivities.filter(a => a.type === 'info_requested').length;
    const booked = campActivities.filter(a => a.type === 'appointment_scheduled').length;

    const stageBreakdown: Record<string, number> = { dormant: 0, education: 0, intent: 0, qualified: 0, licensed_rep: 0 };
    campContacts.forEach(c => stageBreakdown[c.stage]++);

    const avgIntent = campContacts.length > 0
      ? Math.round(campContacts.reduce((s, c) => s + c.intentScore, 0) / campContacts.length)
      : 0;

    return { sent, opened, clicked, replied, requested, booked, stageBreakdown, avgIntent };
  }, [activities, campContacts, id]);

  const stageBreakdown = PIPELINE_STAGES.map(s => ({ ...s, count: detailed.stageBreakdown[s.key] || 0 }));

  // Compute warm leads from this campaign
  const warmLeads = useMemo(() => {
    const highValueTypes = ['reply_received', 'info_requested', 'appointment_scheduled'];
    const campActivities = activities.filter(a => a.campaignId === id && highValueTypes.includes(a.type));
    const seen = new Set<string>();
    return campActivities.map(act => {
      if (seen.has(act.contactId)) return null;
      seen.add(act.contactId);
      const contact = contacts.find(c => c.id === act.contactId);
      if (!contact) return null;
      const tierMap: Record<string, string> = { reply_received: 'Replied', info_requested: 'Requested Info', appointment_scheduled: 'Replied' };
      return { contact, action: act, tierLabel: tierMap[act.type] || 'Engaged' };
    }).filter(Boolean).slice(0, 3);
  }, [activities, contacts, id]);

  const companions = PDF_COMPANIONS.filter(p => p.campaignId === id);

  const handleDownloadCompanion = useCallback(async (companionId: string, title: string) => {
    setDownloadingPdfId(companionId);
    try {
      const res = await fetch('/api/ai/generate-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId }),
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully');
    } catch {
      showToast('Failed to generate PDF');
    } finally {
      setDownloadingPdfId(null);
    }
  }, [showToast]);

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'sequence' as const, label: 'Email Sequence' },
    { key: 'contacts' as const, label: 'Enrolled Contacts' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <PageHeader
        title={campaign.name}
        subtitle={`${campaign.serviceLine} \u2022 ${campaign.emailSequence.length}-email sequence over ${campaign.emailSequence[campaign.emailSequence.length - 1]?.sendDay} days`}
        breadcrumbs={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name },
        ]}
        action={
          <div className="flex gap-2">
            <Link href={`/campaigns/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors">
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
            <button onClick={() => {
              if (campaign.status === 'active') {
                openConfirmDialog({
                  title: 'Pause Campaign?',
                  message: `This will pause "${campaign.name}". No new emails will be sent until you resume it.`,
                  confirmLabel: 'Pause',
                  destructive: false,
                  onConfirm: () => toggleCampaignStatus(campaign.id),
                });
              } else {
                toggleCampaignStatus(campaign.id);
              }
            }}
              className="px-4 py-2.5 text-sm font-semibold border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors">
              {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
            </button>
            <button onClick={() => openSendTestModal(id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors">
              <Send className="w-4 h-4" />
              Send Test Email
            </button>
            <button onClick={() => openEnrollModal()}
              className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
              Enroll More Contacts
            </button>
          </div>
        }
      />

      {/* Status + Metrics Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
        <div className="h-1" style={{ backgroundColor: cfg.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
              <Icon name={cfg.icon} className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  campaign.status === 'active' ? 'bg-emerald-50 text-emerald-700'
                  : campaign.status === 'draft' ? 'bg-neutral-100 text-neutral-500'
                  : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    campaign.status === 'active' ? 'bg-emerald-500'
                    : campaign.status === 'draft' ? 'bg-neutral-400'
                    : 'bg-amber-500'
                  }`} />
                  {campaign.status}
                </span>
                <span className="text-xs text-neutral-500">{campaign.enrolledCount} contacts enrolled</span>
              </div>
              <p className="text-sm text-neutral-500">{campaign.description}</p>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 glass-card-premium rounded-xl p-3">
            <MetricBox label="Enrolled" value={campaign.enrolledCount} />
            <MetricBox label="Sent" value={detailed.sent} />
            <MetricBox label="Opened" value={detailed.opened} sub={`${detailed.sent > 0 ? Math.round(detailed.opened / detailed.sent * 100) : 0}%`} />
            <MetricBox label="Clicked" value={detailed.clicked} sub={`${detailed.sent > 0 ? Math.round(detailed.clicked / detailed.sent * 100) : 0}%`} />
            <MetricBox label="Replies" value={detailed.replied} highlight />
            <MetricBox label="Info Req" value={detailed.requested} highlight />
            <MetricBox label="Appointments" value={detailed.booked} highlight />
            <MetricBox label="Avg Intent" value={detailed.avgIntent} sub="/100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <div className="flex gap-6 relative">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
              style={activeTab === tab.key ? { borderImage: 'linear-gradient(to right, #4f46e5, #7c3aed) 1' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Drip Timeline Visual */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Email Drip Sequence</h2>
            <DripTimeline steps={campaign.emailSequence} color={cfg.color} />
          </div>

          {/* Warm Leads from This Campaign */}
          {warmLeads.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-semibold text-neutral-900">Warm Leads from This Campaign</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full">{warmLeads.length}</span>
                </div>
                <Link href="/warm-leads" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  View all warm leads &rarr;
                </Link>
              </div>
              <p className="text-sm text-amber-800 mb-3">These contacts responded to this campaign and are ready for personal follow-up.</p>
              <div className="space-y-2">
                {warmLeads.map(lead => {
                  if (!lead) return null;
                  const tierColors: Record<string, { bg: string; text: string }> = {
                    Replied: { bg: 'bg-red-50', text: 'text-red-700' },
                    'Requested Info': { bg: 'bg-amber-50', text: 'text-amber-700' },
                    Engaged: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
                  };
                  const tc = tierColors[lead.tierLabel] || tierColors.Engaged;
                  return (
                    <div key={lead.contact.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-600">
                          {lead.contact.firstName[0]}{lead.contact.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{lead.contact.firstName} {lead.contact.lastName}</p>
                          <p className="text-xs text-neutral-500">{lead.action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tc.bg} ${tc.text}`}>{lead.tierLabel}</span>
                        <Link href={`/audience/${lead.contact.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded-lg">
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDF Companion Documents */}
          {companions.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-semibold text-neutral-900">Companion Documents</h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{companions.length} PDF{companions.length > 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm text-neutral-500 mb-4">Downloadable guides designed to accompany this campaign&apos;s email sequence.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {companions.map(comp => {
                  const isDownloading = downloadingPdfId === comp.id;
                  return (
                    <div key={comp.id} className="border border-neutral-100 rounded-xl p-4 hover:shadow-md hover:border-neutral-200 transition-all duration-300 bg-gradient-to-br from-neutral-50/50 to-white">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{comp.title}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{comp.description}</p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <span className="text-[10px] text-neutral-400 font-medium">{comp.pageCount} pages</span>
                            <span className="text-[10px] text-neutral-400 font-medium">{comp.sections.length} sections</span>
                            <button
                              onClick={() => handleDownloadCompanion(comp.id, comp.title)}
                              disabled={isDownloading}
                              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all disabled:opacity-60"
                              style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)` }}
                            >
                              {isDownloading ? (
                                <>
                                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  Download PDF
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Contact Stage Breakdown</h2>
            <div className="space-y-3">
              {stageBreakdown.map(stage => (
                <div key={stage.key} className="flex items-center gap-3">
                  <Icon name={stage.icon} className="w-4 h-4" style={{ color: stage.color }} />
                  <span className="text-sm text-neutral-700 w-24">{stage.label}</span>
                  <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${campContacts.length > 0 ? (stage.count / campContacts.length) * 100 : 0}%`, backgroundColor: stage.color }} />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 w-8 text-right">{stage.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                <span className="font-semibold">Avg intent score:</span> <span className={`font-semibold ${detailed.avgIntent >= 50 ? 'text-amber-600' : 'text-neutral-600'}`}>{detailed.avgIntent}/100</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Email Sequence */}
      {activeTab === 'sequence' && (
        <div className="space-y-4">
          {campaign.emailSequence.map((step, i) => {
            const stepSent = Math.round(campaign.enrolledCount * (1 - i * 0.05));
            const stepOpened = Math.round(stepSent * (campaign.openRate / 100) * (1 - i * 0.08));
            const stepClicked = Math.round(stepSent * (campaign.clickRate / 100) * (1 + i * 0.1));
            return (
              <div key={step.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-300 card-hover-premium">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/80 to-white">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: cfg.color }}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Day {step.sendDay}: {step.subject}</p>
                      <p className="text-xs text-neutral-400">{step.previewText}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div><p className="text-sm font-semibold text-neutral-900">{stepSent}</p><p className="text-[10px] text-neutral-400">Sent</p></div>
                    <div><p className="text-sm font-semibold text-indigo-600">{stepOpened}</p><p className="text-[10px] text-neutral-400">Opened</p></div>
                    <div><p className="text-sm font-semibold text-amber-600">{stepClicked}</p><p className="text-[10px] text-neutral-400">Clicked</p></div>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold self-center ${step.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${step.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                      {step.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="max-w-2xl mx-auto bg-neutral-50 rounded-xl border border-neutral-100 p-6">
                    <div className="text-xs text-neutral-400 mb-3 pb-3 border-b border-neutral-200">
                      <span className="font-medium">From:</span> FFA North Team &lt;outreach@ffanorth.com&gt;<br />
                      <span className="font-medium">Subject:</span> {step.subject}<br />
                      <span className="font-medium">Preview:</span> {step.previewText}
                    </div>
                    {step.bodyFormat === 'html' ? (
                      <div className="text-[13px] text-neutral-700 leading-relaxed prose prose-sm max-w-none
                        [&_a]:text-indigo-600 [&_a]:underline [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2"
                        dangerouslySetInnerHTML={{ __html: step.body }}
                      />
                    ) : (
                      <div className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
                        {step.body}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Enrolled Contacts */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Enrolled Contacts ({campContacts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-2.5 px-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Name</th>
                  <th className="text-left py-2.5 px-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Company</th>
                  <th className="text-left py-2.5 px-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Stage</th>
                  <th className="text-left py-2.5 px-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Intent</th>
                  <th className="text-left py-2.5 px-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {campContacts.slice(0, 20).map(contact => {
                  const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                  const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);
                  return (
                    <tr key={contact.id} className="hover:bg-neutral-50 transition-colors even:bg-neutral-50/50">
                      <td className="py-2.5 px-3">
                        <Link href={`/audience/${contact.id}`} className="font-semibold text-indigo-600 hover:text-indigo-800 text-[13px]">
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 text-[13px]">{contact.company || '\u2014'}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium inline-flex items-center gap-1" style={{ backgroundColor: sm?.color }}>
                          {sm && <Icon name={sm.icon} className="w-3 h-3" />} {sm?.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold text-[13px] ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-neutral-400'}`}>
                          {contact.intentScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[13px]">
                        <span className={daysSince > 180 ? 'text-red-500' : daysSince > 90 ? 'text-amber-500' : 'text-neutral-500'}>
                          {daysSince}d ago
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {campContacts.length > 20 && <p className="text-xs text-neutral-400 text-center py-3">Showing 20 of {campContacts.length}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  const isGood = highlight && value > 0;
  const isRate = sub?.endsWith('%');
  const rateValue = isRate ? parseInt(sub || '0') : 0;
  const rateColor = isRate ? (rateValue >= 20 ? 'text-emerald-600' : rateValue >= 10 ? 'text-amber-600' : 'text-neutral-900') : '';

  return (
    <div className={`rounded-xl p-3 text-center transition-all duration-300 hover:shadow-md ${
      isGood ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100' : 'bg-gradient-to-br from-neutral-50 to-white border border-neutral-100/50'
    }`}>
      <p className={`text-xl font-semibold ${isGood ? 'text-amber-600' : rateColor || 'text-neutral-900'}`}>{value}</p>
      {sub && <span className={`text-[10px] ${isGood ? 'text-amber-400' : 'text-neutral-400'}`}>{sub}</span>}
      <p className={`text-[10px] mt-0.5 ${isGood ? 'text-amber-500' : 'text-neutral-400'}`}>{label}</p>
    </div>
  );
}
