import { getCampaigns } from '@/lib/data';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';

export default function CampaignsPage() {
  const campaigns = getCampaigns();
  const totalEnrolled = campaigns.reduce((s, c) => s + c.enrolledCount, 0);
  const totalIntent = campaigns.reduce((s, c) => s + c.intentSignals, 0);

  return (
    <div className="max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Campaigns</h1>
        <p className="text-slate-500 mt-1 text-[15px]">Education-only email sequences across 5 service lines</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Campaigns</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Contacts Enrolled</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalEnrolled}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Intent Signals</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{totalIntent}</p>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="space-y-4">
        {campaigns.map(campaign => {
          const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
          return (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}
              className="block bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
              <div className="h-1" style={{ backgroundColor: cfg.color }} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>{campaign.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{campaign.description}</p>

                    <div className="flex gap-8">
                      <div><p className="text-2xl font-extrabold text-slate-900">{campaign.enrolledCount}</p><p className="text-[11px] text-slate-400">Enrolled</p></div>
                      <div><p className="text-2xl font-extrabold text-slate-900">{campaign.openRate}%</p><p className="text-[11px] text-slate-400">Open Rate</p></div>
                      <div><p className="text-2xl font-extrabold text-slate-900">{campaign.clickRate}%</p><p className="text-[11px] text-slate-400">Click Rate</p></div>
                      <div><p className="text-2xl font-extrabold text-amber-600">{campaign.intentSignals}</p><p className="text-[11px] text-slate-400">Intent Signals</p></div>
                    </div>

                    {/* Email sequence preview */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-2">{campaign.emailSequence.length}-Email Sequence</p>
                      <div className="flex gap-2">
                        {campaign.emailSequence.map((step, i) => (
                          <div key={step.id} className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                                style={{ backgroundColor: cfg.color }}>{i + 1}</span>
                              <span className="text-[10px] text-slate-400">Day {step.sendDay}</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-700 line-clamp-1">{step.subject}</p>
                          </div>
                        ))}
                      </div>
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
