import { getCampaign, getContactsByCampaign, getActivities } from '@/lib/data';
import { PIPELINE_STAGES } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = getCampaign(id);

  if (!campaign) {
    notFound();
  }

  const contacts = getContactsByCampaign(id);
  const activities = getActivities(20).filter(a => a.campaignId === id);

  // Stage breakdown
  const stageBreakdown = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: contacts.filter(c => c.stage === stage.key).length,
  }));

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/campaigns" className="hover:text-blue-600">Campaigns</Link>
        <span>/</span>
        <span className="text-slate-900">{campaign.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
          <p className="text-slate-500 mt-1">{campaign.serviceLine}</p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">{campaign.description}</p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
          campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
          campaign.status === 'draft' ? 'bg-slate-100 text-slate-600' :
          'bg-amber-100 text-amber-700'
        }`}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricBox label="Enrolled" value={campaign.enrolledCount.toString()} />
        <MetricBox label="Open Rate" value={`${campaign.openRate}%`} />
        <MetricBox label="Click Rate" value={`${campaign.clickRate}%`} />
        <MetricBox label="Intent Signals" value={campaign.intentSignals.toString()} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Sequence */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Sequence</h2>
          <div className="space-y-3">
            {campaign.emailSequence.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  step.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Day {step.sendDay}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Stages</h2>
          <div className="space-y-3">
            {stageBreakdown.map(stage => (
              <div key={stage.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm text-slate-700">{stage.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${contacts.length > 0 ? (stage.count / contacts.length) * 100 : 0}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-8 text-right">{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.length > 0 ? activities.slice(0, 8).map(activity => (
              <div key={activity.id} className="py-2 border-b border-slate-100 last:border-0">
                <p className="text-sm text-slate-700">{activity.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            )) : (
              <p className="text-sm text-slate-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Enrolled Contacts ({contacts.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Name</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Email</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Stage</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Intent Score</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {contacts.slice(0, 25).map(contact => {
                const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);
                return (
                  <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{contact.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: stageMeta?.color }}
                      >
                        {stageMeta?.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-medium ${
                        contact.intentScore >= 70 ? 'text-emerald-600' :
                        contact.intentScore >= 30 ? 'text-amber-600' :
                        'text-slate-400'
                      }`}>
                        {contact.intentScore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(contact.lastContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {contacts.length > 25 && (
            <p className="text-sm text-slate-400 text-center py-3">
              Showing 25 of {contacts.length} contacts
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}
