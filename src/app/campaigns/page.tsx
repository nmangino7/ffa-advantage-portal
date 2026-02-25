import { getCampaigns, getCampaignDetailedMetrics } from '@/lib/data';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';

export default function CampaignsPage() {
  const campaigns = getCampaigns();

  // Aggregate metrics
  const totalEnrolled = campaigns.reduce((s, c) => s + c.enrolledCount, 0);
  const totalIntent = campaigns.reduce((s, c) => s + c.intentSignals, 0);
  const allMetrics = campaigns.map(c => ({ ...c, detailed: getCampaignDetailedMetrics(c.id) }));
  const totalSent = allMetrics.reduce((s, c) => s + c.detailed.sent, 0);
  const totalOpened = allMetrics.reduce((s, c) => s + c.detailed.opened, 0);
  const totalClicked = allMetrics.reduce((s, c) => s + c.detailed.clicked, 0);
  const totalReplies = allMetrics.reduce((s, c) => s + c.detailed.replied, 0);
  const totalRequested = allMetrics.reduce((s, c) => s + c.detailed.requested, 0);
  const totalBooked = allMetrics.reduce((s, c) => s + c.detailed.booked, 0);

  return (
    <div className="max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Campaigns</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Education-only email sequences across 5 service lines &bull; {totalEnrolled.toLocaleString()} contacts enrolled</p>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        <SummaryBox label="Active" value={campaigns.filter(c => c.status === 'active').length.toString()} sub={`of ${campaigns.length}`} />
        <SummaryBox label="Enrolled" value={totalEnrolled.toString()} />
        <SummaryBox label="Emails Sent" value={totalSent.toString()} />
        <SummaryBox label="Opened" value={totalOpened.toString()} sub={`${totalSent > 0 ? Math.round(totalOpened / totalSent * 100) : 0}%`} />
        <SummaryBox label="Clicked" value={totalClicked.toString()} sub={`${totalSent > 0 ? Math.round(totalClicked / totalSent * 100) : 0}%`} />
        <SummaryBox label="Replies" value={totalReplies.toString()} highlight />
        <SummaryBox label="Info Requests" value={totalRequested.toString()} highlight />
        <SummaryBox label="Appointments" value={totalBooked.toString()} highlight />
      </div>

      {/* Campaign Cards */}
      <div className="space-y-5">
        {allMetrics.map(({ detailed, ...campaign }) => {
          const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
          const conversionRate = detailed.sent > 0 ? ((detailed.replied + detailed.requested + detailed.booked) / detailed.sent * 100).toFixed(1) : '0';

          return (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}
              className="block bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: cfg.color }} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>{campaign.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{campaign.description}</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
                      <MetricCell label="Enrolled" value={campaign.enrolledCount} />
                      <MetricCell label="Sent" value={detailed.sent} />
                      <MetricCell label="Opened" value={detailed.opened} sub={`${detailed.sent > 0 ? Math.round(detailed.opened / detailed.sent * 100) : 0}%`} />
                      <MetricCell label="Clicked" value={detailed.clicked} sub={`${detailed.sent > 0 ? Math.round(detailed.clicked / detailed.sent * 100) : 0}%`} />
                      <MetricCell label="Replies" value={detailed.replied} highlight />
                      <MetricCell label="Info Req" value={detailed.requested} highlight />
                      <MetricCell label="Appts" value={detailed.booked} highlight />
                      <MetricCell label="Conversion" value={conversionRate + '%'} highlight />
                    </div>

                    {/* Engagement funnel bar */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-slate-100">
                        {detailed.sent > 0 && (
                          <>
                            <div className="h-full rounded-full" style={{ width: `${(detailed.opened / detailed.sent) * 100}%`, backgroundColor: '#3b82f6' }} title="Opened" />
                            <div className="h-full rounded-full" style={{ width: `${(detailed.clicked / detailed.sent) * 100}%`, backgroundColor: '#f59e0b' }} title="Clicked" />
                            <div className="h-full rounded-full" style={{ width: `${(detailed.replied / detailed.sent) * 100}%`, backgroundColor: '#10b981' }} title="Replied" />
                            <div className="h-full rounded-full" style={{ width: `${(detailed.booked / detailed.sent) * 100}%`, backgroundColor: '#8b5cf6' }} title="Booked" />
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Opened</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Clicked</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Replied</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Booked</span>
                      </div>
                    </div>

                    {/* Email sequence preview */}
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-2.5">
                        {campaign.emailSequence.length}-Email Sequence &bull; Over {campaign.emailSequence[campaign.emailSequence.length - 1]?.sendDay} days
                      </p>
                      <div className="flex gap-2">
                        {campaign.emailSequence.map((step, i) => {
                          const stepSent = Math.round(campaign.enrolledCount * (1 - i * 0.05));
                          const stepOpened = Math.round(stepSent * (campaign.openRate / 100) * (1 - i * 0.08));
                          return (
                            <div key={step.id} className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                                  style={{ backgroundColor: cfg.color }}>{i + 1}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Day {step.sendDay}</span>
                                <span className={`text-[8px] px-1 py-0.5 rounded-full font-bold ml-auto ${step.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {step.status}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-700 line-clamp-1 mb-1">{step.subject}</p>
                              <div className="flex gap-2 text-[9px] text-slate-400">
                                <span>{stepSent} sent</span>
                                <span>{stepOpened} opened</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage breakdown mini */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 items-center flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Contact Stages:</span>
                      <span className="text-[10px] text-slate-500">
                        💤 {detailed.stageBreakdown.dormant} &bull;
                        📧 {detailed.stageBreakdown.education} &bull;
                        🔥 {detailed.stageBreakdown.intent} &bull;
                        ✅ {detailed.stageBreakdown.qualified} &bull;
                        🤝 {detailed.stageBreakdown.licensed_rep}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        Avg Intent: <strong className={`${detailed.avgIntent >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>{detailed.avgIntent}/100</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SummaryBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3 text-center">
      <p className={`text-xl font-extrabold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function MetricCell({ label, value, sub, highlight }: { label: string; value: number | string; sub?: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-extrabold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <span className="text-[9px] text-slate-400">{sub}</span>}
      <p className="text-[9px] text-slate-400">{label}</p>
    </div>
  );
}
