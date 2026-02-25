import { getDashboardMetrics, getCampaigns, getActivities } from '@/lib/data';
import { PIPELINE_STAGES } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const metrics = getDashboardMetrics();
  const campaigns = getCampaigns();
  const recentActivity = getActivities(10);
  const totalInPipeline = Object.values(metrics.pipelineStats).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Enterprise Contact &amp; Lead Regeneration Overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Contacts"
          value={metrics.totalContacts.toLocaleString()}
          sub="In database"
          color="bg-blue-50 text-blue-700"
        />
        <MetricCard
          label="Active Campaigns"
          value={metrics.activeCampaigns.toString()}
          sub={`of ${campaigns.length} total`}
          color="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Intent Signals"
          value={metrics.recentIntentSignals.toString()}
          sub="Last 7 days"
          color="bg-purple-50 text-purple-700"
        />
        <MetricCard
          label="Appointments"
          value={metrics.appointmentsScheduled.toString()}
          sub="Scheduled"
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Pipeline Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Pipeline Overview</h2>
          <Link href="/pipeline" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Pipeline Board &rarr;
          </Link>
        </div>
        <div className="flex rounded-lg overflow-hidden h-10 mb-4">
          {PIPELINE_STAGES.map(stage => {
            const count = metrics.pipelineStats[stage.key];
            const pct = (count / totalInPipeline) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={stage.key}
                className="flex items-center justify-center text-white text-xs font-medium transition-all"
                style={{ width: `${pct}%`, backgroundColor: stage.color, minWidth: pct > 3 ? undefined : '2%' }}
                title={`${stage.label}: ${count}`}
              >
                {pct > 8 ? `${count}` : ''}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4">
          {PIPELINE_STAGES.map(stage => {
            const count = metrics.pipelineStats[stage.key];
            return (
              <div key={stage.key} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-slate-600">{stage.label}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Campaign Performance</h2>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {campaigns.map(campaign => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{campaign.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    campaign.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>{campaign.enrolledCount} enrolled</span>
                  <span>{campaign.openRate}% open rate</span>
                  <span>{campaign.clickRate}% CTR</span>
                  <span className="text-amber-600 font-medium">{campaign.intentSignals} intent signals</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }: {
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    email_sent: 'bg-blue-100 text-blue-600',
    email_opened: 'bg-sky-100 text-sky-600',
    email_clicked: 'bg-amber-100 text-amber-600',
    reply_received: 'bg-green-100 text-green-600',
    info_requested: 'bg-purple-100 text-purple-600',
    appointment_scheduled: 'bg-emerald-100 text-emerald-600',
    campaign_enrolled: 'bg-indigo-100 text-indigo-600',
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type] || 'bg-slate-100 text-slate-600'}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {type === 'email_sent' && <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />}
        {type === 'email_opened' && <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />}
        {type === 'email_clicked' && <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />}
        {(type === 'reply_received' || type === 'info_requested') && <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />}
        {type === 'appointment_scheduled' && <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />}
        {type === 'campaign_enrolled' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />}
      </svg>
    </div>
  );
}
