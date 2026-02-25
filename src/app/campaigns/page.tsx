import { getCampaigns } from '@/lib/data';
import Link from 'next/link';

export default function CampaignsPage() {
  const campaigns = getCampaigns();

  const serviceLineColors: Record<string, string> = {
    'Insurance Review': 'bg-blue-500',
    'Under-Serviced Annuities': 'bg-purple-500',
    'Retirement Planning': 'bg-emerald-500',
    'Investment Planning': 'bg-amber-500',
    'Second-Opinion Positioning': 'bg-rose-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">Education-only marketing campaigns by service line</p>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Active Campaigns</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Enrolled</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {campaigns.reduce((sum, c) => sum + c.enrolledCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Intent Signals</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {campaigns.reduce((sum, c) => sum + c.intentSignals, 0)}
          </p>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map(campaign => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.id}`}
            className="block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
          >
            <div className={`h-1.5 ${serviceLineColors[campaign.serviceLine] || 'bg-slate-300'}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{campaign.serviceLine}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  campaign.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                  campaign.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{campaign.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Enrolled</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.enrolledCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Open Rate</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.openRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Click Rate</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.clickRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Intent</p>
                  <p className="text-lg font-bold text-amber-600">{campaign.intentSignals}</p>
                </div>
              </div>

              {/* Email Sequence Preview */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Email Sequence ({campaign.emailSequence.length} emails)</p>
                <div className="flex gap-1">
                  {campaign.emailSequence.map((step, i) => (
                    <div
                      key={step.id}
                      className={`flex-1 h-1.5 rounded-full ${
                        step.status === 'active' ? 'bg-blue-400' : 'bg-slate-200'
                      }`}
                      title={`Day ${step.sendDay}: ${step.subject}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
