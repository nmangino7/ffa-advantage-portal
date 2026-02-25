import { getCampaign, getContactsByCampaign } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign) notFound();

  const contacts = getContactsByCampaign(id);
  const cfg = SERVICE_LINE_CONFIG[campaign.serviceLine];
  const stageBreakdown = PIPELINE_STAGES.map(s => ({
    ...s, count: contacts.filter(c => c.stage === s.key).length,
  }));

  return (
    <div className="max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/campaigns" className="hover:text-blue-600">Campaigns</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{campaign.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
        <div className="h-1.5" style={{ backgroundColor: cfg.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
              {cfg.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">{campaign.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{campaign.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div><p className="text-3xl font-extrabold text-slate-900">{campaign.enrolledCount}</p><p className="text-xs text-slate-400">Enrolled</p></div>
            <div><p className="text-3xl font-extrabold text-slate-900">{campaign.openRate}%</p><p className="text-xs text-slate-400">Open Rate</p></div>
            <div><p className="text-3xl font-extrabold text-slate-900">{campaign.clickRate}%</p><p className="text-xs text-slate-400">Click Rate</p></div>
            <div><p className="text-3xl font-extrabold text-amber-600">{campaign.intentSignals}</p><p className="text-xs text-slate-400">Intent Signals</p></div>
          </div>
        </div>
      </div>

      {/* Email Sequence — Full Previews */}
      <div className="mb-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">📧 Email Sequence ({campaign.emailSequence.length} emails)</h2>
        <div className="space-y-4">
          {campaign.emailSequence.map((step, i) => (
            <div key={step.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: cfg.color }}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Day {step.sendDay}: {step.subject}</p>
                  <p className="text-xs text-slate-400">{step.previewText}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${step.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {step.status}
                </span>
              </div>
              <div className="p-6">
                <div className="max-w-2xl mx-auto bg-slate-50 rounded-xl border border-slate-100 p-6">
                  <div className="text-xs text-slate-400 mb-3 pb-3 border-b border-slate-200">
                    <span className="font-medium">From:</span> FFA North Team &lt;outreach@ffanorth.com&gt;<br />
                    <span className="font-medium">Subject:</span> {step.subject}
                  </div>
                  <div className="email-body text-[13px] text-slate-700 leading-relaxed">
                    {step.body.split('\n').map((line, j) => (
                      <span key={j}>
                        {line.startsWith('•') || line.startsWith('✓') || line.startsWith('Q:') || line.startsWith('A:') || line.startsWith('Step') || /^\d\./.test(line.trim())
                          ? <span className="font-medium">{line}</span>
                          : line}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stage Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-4">Contact Stages</h2>
          <div className="space-y-3">
            {stageBreakdown.map(stage => (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="text-base">{stage.icon}</span>
                <span className="text-sm text-slate-700 w-24">{stage.label}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${contacts.length > 0 ? (stage.count / contacts.length) * 100 : 0}%`,
                    backgroundColor: stage.color,
                  }} />
                </div>
                <span className="text-sm font-bold text-slate-900 w-8 text-right">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled Contacts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[17px] font-bold text-slate-900 mb-4">Enrolled Contacts ({contacts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Name</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Email</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Stage</th>
                  <th className="text-left py-2.5 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Intent</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 15).map(contact => {
                  const sm = PIPELINE_STAGES.find(s => s.key === contact.stage);
                  return (
                    <tr key={contact.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <Link href={`/contacts/${contact.id}`} className="font-semibold text-blue-600 hover:text-blue-800 text-[13px]">
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[13px]">{contact.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: sm?.color }}>
                          {sm?.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold text-[13px] ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {contact.intentScore}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {contacts.length > 15 && <p className="text-xs text-slate-400 text-center py-3">Showing 15 of {contacts.length}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
