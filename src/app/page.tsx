import { getDashboardMetrics, getCampaigns, getActivities, getHotLeads } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const m = getDashboardMetrics();
  const campaigns = getCampaigns();
  const recentActivity = getActivities(12);
  const hotLeads = getHotLeads(8);
  const total = Object.values(m.pipelineStats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1400px]">
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Marketing Outreach Dashboard</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Re-engage dormant leads across 5 service lines &mdash; education-only campaigns, compliance-first</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard value={m.totalContacts.toLocaleString()} label="Total Contacts" sub="In HubSpot" accent="blue" />
        <StatCard value={(total - m.pipelineStats.dormant).toString()} label="Active in Pipeline" sub={`${m.pipelineStats.dormant} still dormant`} accent="indigo" />
        <StatCard value={m.emailsSent.toString()} label="Emails Sent" sub="All campaigns" accent="sky" />
        <StatCard value={`${m.engagementRate}%`} label="Engagement Rate" sub="Opens + clicks + replies" accent="amber" />
        <StatCard value={m.appointmentsScheduled.toString()} label="Appointments" sub="Booked with reps" accent="emerald" />
      </div>

      {/* Outreach Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">Outreach Funnel</h2>
            <p className="text-xs text-slate-400 mt-0.5">How contacts move from dormant to booked appointments</p>
          </div>
          <Link href="/pipeline" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
            Open Pipeline Board &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = m.pipelineStats[stage.key];
            const pct = total > 0 ? (count / total) * 100 : 0;
            const maxPct = Math.max(...Object.values(m.pipelineStats)) / total * 100;
            const barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0;
            return (
              <div key={stage.key} className="flex items-center gap-4">
                <div className="w-[140px] flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">{stage.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-700">{stage.label}</p>
                    <p className="text-[10px] text-slate-400">{stage.description}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{ width: `${Math.max(barWidth, 2)}%`, backgroundColor: stage.color }}
                    >
                      {barWidth > 15 && <span className="text-white text-xs font-bold">{count}</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-12 text-right">{count}</span>
                  <span className="text-xs text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <span className="text-slate-300 text-xs flex-shrink-0">&darr;</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
          <span>Conversion: Dormant &rarr; Education <strong className="text-blue-600">{total > 0 ? ((m.pipelineStats.education / Math.max(m.pipelineStats.dormant, 1)) * 100).toFixed(0) : 0}%</strong></span>
          <span>Education &rarr; Intent <strong className="text-amber-600">{m.pipelineStats.education > 0 ? ((m.pipelineStats.intent / m.pipelineStats.education) * 100).toFixed(0) : 0}%</strong></span>
          <span>Intent &rarr; Appointment <strong className="text-emerald-600">{m.pipelineStats.intent > 0 ? ((m.pipelineStats.licensed_rep / m.pipelineStats.intent) * 100).toFixed(0) : 0}%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Campaign Performance */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-slate-900">Campaign Performance</h2>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">View All &rarr;</Link>
          </div>
          <div className="space-y-3">
            {campaigns.map(camp => {
              const cfg = SERVICE_LINE_CONFIG[camp.serviceLine];
              return (
                <Link key={camp.id} href={`/campaigns/${camp.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 truncate">{camp.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{camp.serviceLine} &bull; {camp.emailSequence.length} emails in sequence</p>
                  </div>
                  <div className="flex gap-6 flex-shrink-0 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{camp.enrolledCount}</p>
                      <p className="text-[10px] text-slate-400">Enrolled</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{camp.openRate}%</p>
                      <p className="text-[10px] text-slate-400">Open Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{camp.clickRate}%</p>
                      <p className="text-[10px] text-slate-400">CTR</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600">{camp.intentSignals}</p>
                      <p className="text-[10px] text-slate-400">Intent</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-slate-900">🔥 Hot Leads</h2>
            <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">All Contacts &rarr;</Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">Highest intent scores — ready for outreach</p>
          <div className="space-y-2">
            {hotLeads.map(lead => {
              const stage = PIPELINE_STAGES.find(s => s.key === lead.stage);
              return (
                <Link key={lead.id} href={`/contacts/${lead.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: stage?.color || '#94a3b8' }}>
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{lead.firstName} {lead.lastName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{lead.company || lead.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-black ${lead.intentScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {lead.intentScore}
                    </div>
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
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {recentActivity.map(act => {
            const typeConfig: Record<string, { bg: string; icon: string }> = {
              email_sent: { bg: 'bg-blue-50 text-blue-600', icon: '📤' },
              email_opened: { bg: 'bg-sky-50 text-sky-600', icon: '👁️' },
              email_clicked: { bg: 'bg-amber-50 text-amber-600', icon: '🖱️' },
              reply_received: { bg: 'bg-green-50 text-green-600', icon: '💬' },
              info_requested: { bg: 'bg-purple-50 text-purple-600', icon: '❓' },
              appointment_scheduled: { bg: 'bg-emerald-50 text-emerald-600', icon: '📅' },
              campaign_enrolled: { bg: 'bg-indigo-50 text-indigo-600', icon: '➕' },
            };
            const tc = typeConfig[act.type] || { bg: 'bg-slate-50 text-slate-600', icon: '📌' };
            return (
              <div key={act.id} className={`flex items-start gap-3 p-3 rounded-xl ${tc.bg}`}>
                <span className="text-base mt-0.5">{tc.icon}</span>
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-800 font-medium truncate">{act.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
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
    blue: 'from-blue-500 to-blue-700',
    indigo: 'from-indigo-500 to-indigo-700',
    sky: 'from-sky-500 to-sky-700',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-700',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[accent]} rounded-2xl p-5 text-white shadow-sm`}>
      <p className="text-[28px] font-extrabold leading-none">{value}</p>
      <p className="text-[13px] font-semibold mt-1.5 text-white/90">{label}</p>
      <p className="text-[11px] mt-0.5 text-white/60">{sub}</p>
    </div>
  );
}
