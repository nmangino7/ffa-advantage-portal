import { getContact, getCampaigns, getActivities, getContactEngagement } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AudienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = getContact(id);
  if (!contact) notFound();

  const allCampaigns = getCampaigns();
  const contactCampaigns = allCampaigns.filter(c => contact.campaigns.includes(c.id));
  const activities = getActivities(undefined, contact.id);
  const engagement = getContactEngagement(contact.id);
  const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);
  const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);
  const stageIndex = PIPELINE_STAGES.findIndex(s => s.key === contact.stage);

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.company || undefined}
        breadcrumbs={[
          { label: 'Audience', href: '/audience' },
          { label: `${contact.firstName} ${contact.lastName}` },
        ]}
        action={
          <div className="flex gap-2">
            <button className="px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Enroll in Campaign
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors">
              Assign Advisor
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors">
              Schedule Call
            </button>
          </div>
        }
      />

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="h-1" style={{ backgroundColor: stageMeta?.color || '#94a3b8' }} />
        <div className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: stageMeta?.color || '#94a3b8' }}>
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full text-white font-semibold" style={{ backgroundColor: stageMeta?.color }}>
                  {stageMeta?.icon} {stageMeta?.label}
                </span>
                {contact.intentScore > 0 && (
                  <span className={`text-sm font-extrabold ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                    Intent: {contact.intentScore}/100
                  </span>
                )}
                <span className={`text-xs ${daysSince > 180 ? 'text-red-500 font-semibold' : daysSince > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
                  Last contact: {daysSince > 365 ? `${Math.floor(daysSince / 365)}y ${daysSince % 365}d ago` : `${daysSince} days ago`}
                </span>
              </div>

              {/* Pipeline Progress */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-2">Pipeline Position</p>
                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-1 flex-1">
                      <div className={`flex-1 h-2 rounded-full transition-all ${i <= stageIndex ? '' : 'opacity-20'}`}
                        style={{ backgroundColor: s.color }} />
                      {i < PIPELINE_STAGES.length - 1 && <div className="w-1" />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {PIPELINE_STAGES.map((s, i) => (
                    <span key={s.key} className={`text-[9px] ${i <= stageIndex ? 'font-semibold' : 'text-slate-300'}`}
                      style={i <= stageIndex ? { color: s.color } : {}}>
                      {s.icon} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {contact.assignedRep && (
              <div className="text-right">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Assigned Rep</p>
                <p className="text-sm font-semibold text-slate-900">{contact.assignedRep}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-6">
        <EngagementBox label="Total Actions" value={engagement.totalActions} icon="📊" />
        <EngagementBox label="Emails Sent" value={engagement.emailsSent} icon="📤" />
        <EngagementBox label="Emails Opened" value={engagement.emailsOpened} icon="👁️" />
        <EngagementBox label="Links Clicked" value={engagement.emailsClicked} icon="🖱️" />
        <EngagementBox label="Replies" value={engagement.replies} icon="💬" highlight />
        <EngagementBox label="Info Requests" value={engagement.infoRequests} icon="❓" highlight />
        <EngagementBox label="Appointments" value={engagement.appointments} icon="📅" highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Contact Info</h2>
          <div className="space-y-4">
            <InfoField label="Email" value={contact.email} />
            <InfoField label="Phone" value={contact.phone} />
            <InfoField label="Company" value={contact.company || 'N/A'} />
            <InfoField label="In Database Since" value={new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            <InfoField label="Intent Score" value={`${contact.intentScore}/100`}
              valueClass={contact.intentScore >= 70 ? 'text-emerald-600 font-bold' : contact.intentScore >= 30 ? 'text-amber-600 font-bold' : ''} />
            <InfoField label="Days Since Contact" value={daysSince.toString()}
              valueClass={daysSince > 180 ? 'text-red-500 font-bold' : daysSince > 90 ? 'text-amber-500 font-bold' : ''} />
            {contact.assignedRep && <InfoField label="Assigned Rep" value={contact.assignedRep} />}
            {contact.notes && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Notes</p>
                <p className="text-sm text-slate-700 mt-1">{contact.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Campaigns ({contactCampaigns.length})</h2>
          {contactCampaigns.length > 0 ? (
            <div className="space-y-3">
              {contactCampaigns.map(camp => {
                const campCfg = SERVICE_LINE_CONFIG[camp.serviceLine];
                return (
                  <Link key={camp.id} href={`/campaigns/${camp.id}`}
                    className="block p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{campCfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900">{camp.name}</p>
                        <p className="text-[11px] text-slate-400">{camp.serviceLine}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${camp.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {camp.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {camp.emailSequence.map((step) => (
                          <div key={step.id} className="flex-1">
                            <div className="h-1.5 rounded-full" style={{ backgroundColor: step.status === 'active' ? campCfg.color : '#e2e8f0' }} />
                            <p className="text-[8px] text-slate-400 mt-0.5 text-center">Day {step.sendDay}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                      <span>{camp.emailSequence.length} emails</span>
                      <span>{camp.openRate}% open</span>
                      <span>{camp.clickRate}% click</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">💤</p>
              <p className="text-sm text-slate-500">Not enrolled in any campaigns</p>
              <p className="text-xs text-slate-400 mt-1">This contact is dormant</p>
              <button className="mt-3 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                Enroll in Campaign
              </button>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Activity Timeline ({activities.length})</h2>
          {activities.length > 0 ? (
            <div className="space-y-0">
              {activities.map((act, i) => {
                const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
                  email_sent: { icon: '📤', color: '#3b82f6', bg: '#eff6ff' },
                  email_opened: { icon: '👁️', color: '#06b6d4', bg: '#ecfeff' },
                  email_clicked: { icon: '🖱️', color: '#d97706', bg: '#fffbeb' },
                  reply_received: { icon: '💬', color: '#059669', bg: '#ecfdf5' },
                  info_requested: { icon: '❓', color: '#7c3aed', bg: '#f5f3ff' },
                  appointment_scheduled: { icon: '📅', color: '#dc2626', bg: '#fef2f2' },
                  campaign_enrolled: { icon: '➕', color: '#2563eb', bg: '#eff6ff' },
                };
                const tc = typeConfig[act.type] || { icon: '📌', color: '#64748b', bg: '#f1f5f9' };
                const isHighValue = ['reply_received', 'info_requested', 'appointment_scheduled'].includes(act.type);

                return (
                  <div key={act.id} className={`flex gap-3 pb-4 ${isHighValue ? 'bg-amber-50/30 -mx-2 px-2 rounded-lg' : ''}`}>
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: tc.bg }}>
                        {tc.icon}
                      </div>
                      {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-[13px] ${isHighValue ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>{act.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-400">
                          {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                        {act.campaignName && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">{act.campaignName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🕐</p>
              <p className="text-sm text-slate-400">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EngagementBox({ label, value, icon, highlight }: { label: string; value: number; icon: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
      <p className="text-sm mb-1">{icon}</p>
      <p className={`text-xl font-extrabold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function InfoField({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-sm text-slate-900 ${valueClass || ''}`}>{value}</p>
    </div>
  );
}
