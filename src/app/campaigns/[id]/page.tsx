import { getCampaign, getContactsByCampaign, getCampaignDetailedMetrics } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign) notFound();

  const contacts = getContactsByCampaign(id);
  const detailed = getCampaignDetailedMetrics(id);
  const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
  const stageBreakdown = PIPELINE_STAGES.map(s => ({ ...s, count: detailed.stageBreakdown[s.key] }));

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/campaigns" className="hover:text-blue-600">Campaigns</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{campaign.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
        <div className="h-1.5" style={{ backgroundColor: cfg.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>{cfg.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">{campaign.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{campaign.status}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{campaign.serviceLine} &bull; {campaign.emailSequence.length}-email sequence over {campaign.emailSequence[campaign.emailSequence.length-1]?.sendDay} days</p>
              <p className="text-[13px] text-slate-600 mt-2">{campaign.description}</p>
            </div>
          </div>

          {/* Detailed metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <MetricBox label="Enrolled" value={campaign.enrolledCount.toString()} />
            <MetricBox label="Emails Sent" value={detailed.sent.toString()} />
            <MetricBox label="Opened" value={detailed.opened.toString()} sub={`${detailed.sent > 0 ? Math.round(detailed.opened/detailed.sent*100) : 0}%`} />
            <MetricBox label="Clicked" value={detailed.clicked.toString()} sub={`${detailed.sent > 0 ? Math.round(detailed.clicked/detailed.sent*100) : 0}%`} />
            <MetricBox label="Replies" value={detailed.replied.toString()} highlight />
            <MetricBox label="Info Requested" value={detailed.requested.toString()} highlight />
            <MetricBox label="Appointments" value={detailed.booked.toString()} highlight />
            <MetricBox label="Avg Intent" value={detailed.avgIntent.toString()} sub="/100" />
          </div>
        </div>
      </div>

      {/* Email Sequence with per-step metrics */}
      <div className="mb-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">📧 Email Sequence — Full Previews</h2>
        <div className="space-y-4">
          {campaign.emailSequence.map((step, i) => {
            // Simulated per-email metrics
            const stepSent = Math.round(campaign.enrolledCount * (1 - i * 0.05));
            const stepOpened = Math.round(stepSent * (campaign.openRate / 100) * (1 - i * 0.08));
            const stepClicked = Math.round(stepSent * (campaign.clickRate / 100) * (1 + i * 0.1));
            return (
              <div key={step.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: cfg.color }}>{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Day {step.sendDay}: {step.subject}</p>
                      <p className="text-xs text-slate-400">{step.previewText}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div><p className="text-sm font-bold text-slate-900">{stepSent}</p><p className="text-[10px] text-slate-400">Sent</p></div>
                    <div><p className="text-sm font-bold text-sky-600">{stepOpened}</p><p className="text-[10px] text-slate-400">Opened</p></div>
                    <div><p className="text-sm font-bold text-amber-600">{stepClicked}</p><p className="text-[10px] text-slate-400">Clicked</p></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold self-center ${step.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{step.status}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="max-w-2xl mx-auto bg-slate-50 rounded-xl border border-slate-100 p-6">
                    <div className="text-xs text-slate-400 mb-3 pb-3 border-b border-slate-200">
                      <span className="font-medium">From:</span> FFA North Team &lt;outreach@ffanorth.com&gt;<br />
                      <span className="font-medium">Subject:</span> {step.subject}<br />
                      <span className="font-medium">Preview:</span> {step.previewText}
                    </div>
                    <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {step.body}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Breakdown + Enrolled Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-4">Contact Stage Breakdown</h2>
          <div className="space-y-3">
            {stageBreakdown.map(stage => (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="text-base">{stage.icon}</span>
                <span className="text-sm text-slate-700 w-24">{stage.label}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${contacts.length > 0 ? (stage.count / contacts.length) * 100 : 0}%`, backgroundColor: stage.color }} />
                </div>
                <span className="text-sm font-bold text-slate-900 w-8 text-right">{stage.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <strong>Avg intent score:</strong> <span className={`font-bold ${detailed.avgIntent >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>{detailed.avgIntent}/100</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-4">Enrolled Contacts ({contacts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Name</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Company</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Stage</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Intent</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 20).map(contact => {
                  const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                  const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);
                  return (
                    <tr key={contact.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <Link href={`/contacts/${contact.id}`} className="font-semibold text-blue-600 hover:text-blue-800 text-[13px]">{contact.firstName} {contact.lastName}</Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[13px]">{contact.company || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: sm?.color }}>{sm?.icon} {sm?.label}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold text-[13px] ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>{contact.intentScore}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[13px]">
                        <span className={daysSince > 180 ? 'text-red-500' : daysSince > 90 ? 'text-amber-500' : 'text-slate-500'}>{daysSince}d ago</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {contacts.length > 20 && <p className="text-xs text-slate-400 text-center py-3">Showing 20 of {contacts.length}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className={`text-xl font-extrabold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
