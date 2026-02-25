import { getDashboardMetrics, getCampaigns, getActivities, getHotLeads, getWeeklyOutreach, getActivityBreakdown } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const m = getDashboardMetrics();
  const campaigns = getCampaigns();
  const recentActivity = getActivities(15);
  const hotLeads = getHotLeads(8);
  const weekly = getWeeklyOutreach();
  const breakdown = getActivityBreakdown();
  const total = Object.values(m.pipelineStats).reduce((a, b) => a + b, 0);
  const maxWeeklySent = Math.max(...weekly.map(w => w.sent));

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Marketing Outreach Dashboard</h1>
          <p className="text-slate-500 mt-1 text-[15px]">Re-engage dormant leads across 5 service lines &mdash; education-only campaigns, compliance-first</p>
        </div>
        <Link href="/roadmap" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
          📋 Implementation Roadmap
        </Link>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard value={m.totalContacts.toLocaleString()} label="Total Contacts" sub="In HubSpot database" accent="blue" />
        <StatCard value={(total - m.pipelineStats.dormant).toString()} label="Active in Pipeline" sub={`${m.pipelineStats.dormant} still dormant`} accent="indigo" />
        <StatCard value={m.emailsSent.toString()} label="Emails Sent" sub={`${m.emailsOpened} opened (${m.emailsSent > 0 ? Math.round(m.emailsOpened/m.emailsSent*100) : 0}%)`} accent="sky" />
        <StatCard value={`${m.engagementRate}%`} label="Engagement Rate" sub={`${m.emailsClicked} clicks + ${m.repliesReceived} replies`} accent="amber" />
        <StatCard value={m.appointmentsScheduled.toString()} label="Appointments Booked" sub="With licensed reps" accent="emerald" />
      </div>

      {/* Activity Breakdown + Weekly Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-1">Outreach Activity Breakdown</h2>
          <p className="text-xs text-slate-400 mb-5">All-time engagement metrics across every touchpoint</p>
          <div className="grid grid-cols-2 gap-4">
            <BreakdownItem icon="📤" label="Emails Sent" value={breakdown.emailsSent} total={breakdown.emailsSent} color="#3b82f6" />
            <BreakdownItem icon="👁️" label="Emails Opened" value={breakdown.emailsOpened} total={breakdown.emailsSent} color="#0ea5e9" />
            <BreakdownItem icon="🖱️" label="Links Clicked" value={breakdown.emailsClicked} total={breakdown.emailsSent} color="#f59e0b" />
            <BreakdownItem icon="💬" label="Replies Received" value={breakdown.repliesReceived} total={breakdown.emailsSent} color="#10b981" />
            <BreakdownItem icon="❓" label="Info Requested" value={breakdown.infoRequested} total={breakdown.emailsSent} color="#8b5cf6" />
            <BreakdownItem icon="📅" label="Appointments Booked" value={breakdown.appointmentsBooked} total={breakdown.emailsSent} color="#059669" />
          </div>
        </div>

        {/* Weekly Outreach Volume */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-1">Weekly Outreach Volume</h2>
          <p className="text-xs text-slate-400 mb-5">Emails sent, opened, and clicked per week (last 4 weeks)</p>
          <div className="space-y-4">
            {weekly.map((w) => (
              <div key={w.week}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">{w.week}</span>
                  <span className="text-[11px] text-slate-400">{w.sent} sent &bull; {w.opened} opened &bull; {w.clicked} clicked &bull; {w.replies} replies</span>
                </div>
                <div className="flex gap-1 h-5">
                  <div className="bg-blue-400 rounded-sm h-full transition-all" style={{ width: `${(w.sent/maxWeeklySent)*100}%` }} title={`${w.sent} sent`} />
                </div>
                <div className="flex gap-1 h-2 mt-1">
                  <div className="bg-sky-300 rounded-sm h-full" style={{ width: `${(w.opened/maxWeeklySent)*100}%` }} title={`${w.opened} opened`} />
                  <div className="bg-amber-400 rounded-sm h-full" style={{ width: `${(w.clicked/maxWeeklySent)*100}%` }} title={`${w.clicked} clicked`} />
                  <div className="bg-green-400 rounded-sm h-full" style={{ width: `${(w.replies/maxWeeklySent)*100}%` }} title={`${w.replies} replies`} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />Sent</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-sky-300" />Opened</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />Clicked</span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-green-400" />Replies</span>
          </div>
        </div>
      </div>

      {/* Outreach Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">Outreach Funnel</h2>
            <p className="text-xs text-slate-400 mt-0.5">How contacts move from dormant to booked appointments</p>
          </div>
          <Link href="/pipeline" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Open Pipeline Board &rarr;</Link>
        </div>
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = m.pipelineStats[stage.key];
            const pct = total > 0 ? (count / total) * 100 : 0;
            const maxPct = Math.max(...Object.values(m.pipelineStats)) / total * 100;
            const barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0;
            const prev = i > 0 ? m.pipelineStats[PIPELINE_STAGES[i-1].key] : null;
            const convRate = prev && prev > 0 ? ((count / prev) * 100).toFixed(0) : null;
            return (
              <div key={stage.key}>
                <div className="flex items-center gap-4">
                  <div className="w-[160px] flex items-center gap-2 flex-shrink-0">
                    <span className="text-lg">{stage.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">{stage.label}</p>
                      <p className="text-[10px] text-slate-400">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-9 bg-slate-100 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center px-3" style={{ width: `${Math.max(barWidth, 3)}%`, backgroundColor: stage.color }}>
                        {barWidth > 12 && <span className="text-white text-xs font-bold">{count} contacts</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-20">
                      <span className="text-sm font-bold text-slate-700">{count}</span>
                      <span className="text-xs text-slate-400 ml-1">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
                {convRate && (
                  <div className="ml-[160px] pl-4 flex items-center gap-1.5 py-1">
                    <span className="text-slate-300">&darr;</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{convRate}% conversion</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <strong className="text-slate-700">Overall funnel efficiency:</strong> {m.pipelineStats.dormant > 0 ? ((m.pipelineStats.licensed_rep / m.pipelineStats.dormant) * 100).toFixed(1) : 0}% of dormant contacts converted to appointments &bull;
            {' '}<strong className="text-amber-600">{m.dormantOver1Year}</strong> dormant contacts haven&apos;t been contacted in over 1 year — prime re-engagement targets
          </p>
        </div>
      </div>

      {/* Campaign Performance + Hot Leads */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Campaign Performance</h2>
              <p className="text-xs text-slate-400 mt-0.5">{m.activeCampaigns} active of {m.totalCampaigns} total &bull; {campaigns.reduce((s,c)=>s+c.enrolledCount,0)} total enrolled</p>
            </div>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {campaigns.map(camp => {
              const cfg = SERVICE_LINE_CONFIG[camp.serviceLine];
              return (
                <Link key={camp.id} href={`/campaigns/${camp.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 truncate">{camp.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{camp.serviceLine} &bull; {camp.emailSequence.length}-email sequence &bull; Day 0 → Day {camp.emailSequence[camp.emailSequence.length-1]?.sendDay}</p>
                  </div>
                  <div className="flex gap-5 flex-shrink-0 text-center">
                    <div><p className="text-lg font-bold text-slate-900">{camp.enrolledCount}</p><p className="text-[10px] text-slate-400">Enrolled</p></div>
                    <div><p className="text-lg font-bold text-slate-900">{camp.openRate}%</p><p className="text-[10px] text-slate-400">Open Rate</p></div>
                    <div><p className="text-lg font-bold text-slate-900">{camp.clickRate}%</p><p className="text-[10px] text-slate-400">CTR</p></div>
                    <div><p className="text-lg font-bold text-amber-600">{camp.intentSignals}</p><p className="text-[10px] text-slate-400">Intent</p></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold text-slate-900">🔥 Hot Leads</h2>
            <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">All &rarr;</Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">Highest intent — ready for licensed rep handoff</p>
          <div className="space-y-2">
            {hotLeads.map((lead, i) => {
              const stage = PIPELINE_STAGES.find(s => s.key === lead.stage);
              return (
                <Link key={lead.id} href={`/contacts/${lead.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-[11px] font-bold text-slate-300 w-4">{i+1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: stage?.color || '#94a3b8' }}>
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{lead.firstName} {lead.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{lead.company || lead.email} &bull; {lead.campaigns.length} campaign{lead.campaigns.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-black ${lead.intentScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{lead.intentScore}</div>
                    <p className="text-[10px] text-slate-400">{stage?.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-1">Recent Activity Stream</h2>
        <p className="text-xs text-slate-400 mb-4">Latest engagement signals across all campaigns</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {recentActivity.map(act => {
            const tc: Record<string, { bg: string; icon: string }> = {
              email_sent: { bg:'bg-blue-50', icon:'📤' }, email_opened: { bg:'bg-sky-50', icon:'👁️' },
              email_clicked: { bg:'bg-amber-50', icon:'🖱️' }, reply_received: { bg:'bg-green-50', icon:'💬' },
              info_requested: { bg:'bg-purple-50', icon:'❓' }, appointment_scheduled: { bg:'bg-emerald-50', icon:'📅' },
              campaign_enrolled: { bg:'bg-indigo-50', icon:'➕' },
            };
            const c = tc[act.type] || { bg:'bg-slate-50', icon:'📌' };
            return (
              <div key={act.id} className={`flex items-start gap-3 p-3 rounded-xl ${c.bg}`}>
                <span className="text-base mt-0.5">{c.icon}</span>
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-800 font-medium leading-snug">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                    </p>
                    {act.campaignName && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-slate-500 font-medium">{act.campaignName}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, accent }: { value: string; label: string; sub: string; accent: string }) {
  const colors: Record<string, string> = {
    blue:'from-blue-500 to-blue-700', indigo:'from-indigo-500 to-indigo-700',
    sky:'from-sky-500 to-sky-700', amber:'from-amber-500 to-amber-600', emerald:'from-emerald-500 to-emerald-700',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[accent]} rounded-2xl p-5 text-white shadow-sm`}>
      <p className="text-[28px] font-extrabold leading-none">{value}</p>
      <p className="text-[13px] font-semibold mt-1.5 text-white/90">{label}</p>
      <p className="text-[11px] mt-0.5 text-white/60">{sub}</p>
    </div>
  );
}

function BreakdownItem({ icon, label, value, total, color }: { icon: string; label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-600">{label}</span>
          <span className="text-sm font-bold text-slate-900">{value}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(parseFloat(pct), 100)}%`, backgroundColor: color }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{pct}% of emails sent</p>
      </div>
    </div>
  );
}
