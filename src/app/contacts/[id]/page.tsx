import { getContact, getCampaigns, getActivities } from '@/lib/data';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = getContact(id);
  if (!contact) notFound();

  const allCampaigns = getCampaigns();
  const contactCampaigns = allCampaigns.filter(c => contact.campaigns.includes(c.id));
  const activities = getActivities(undefined, contact.id);
  const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);
  const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Link href="/contacts" className="hover:text-blue-600">Contacts</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{contact.firstName} {contact.lastName}</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: stageMeta?.color || '#94a3b8' }}>
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{contact.firstName} {contact.lastName}</h1>
            {contact.company && <p className="text-slate-500">{contact.company}</p>}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs px-3 py-1 rounded-full text-white font-semibold" style={{ backgroundColor: stageMeta?.color }}>
                {stageMeta?.icon} {stageMeta?.label}
              </span>
              {contact.intentScore > 0 && (
                <span className={`text-sm font-extrabold ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                  Intent: {contact.intentScore}/100
                </span>
              )}
              <span className={`text-xs ${daysSince > 180 ? 'text-red-500 font-semibold' : daysSince > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
                Last contact: {daysSince} days ago
              </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Contact Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm text-slate-900">{contact.email}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Phone</p>
              <p className="text-sm text-slate-900">{contact.phone}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Company</p>
              <p className="text-sm text-slate-900">{contact.company || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">In Database Since</p>
              <p className="text-sm text-slate-900">{new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            {contact.notes && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Notes</p>
                <p className="text-sm text-slate-700 mt-1">{contact.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Campaigns ({contactCampaigns.length})</h2>
          {contactCampaigns.length > 0 ? (
            <div className="space-y-3">
              {contactCampaigns.map(camp => {
                const cfg = SERVICE_LINE_CONFIG[camp.serviceLine];
                return (
                  <Link key={camp.id} href={`/campaigns/${camp.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <span className="text-xl">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900">{camp.name}</p>
                      <p className="text-[11px] text-slate-400">{camp.emailSequence.length} emails &bull; {camp.openRate}% open rate</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">💤</p>
              <p className="text-sm text-slate-400">Not enrolled in any campaigns</p>
              <p className="text-xs text-slate-300 mt-1">This contact is dormant</p>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Activity Timeline</h2>
          {activities.length > 0 ? (
            <div className="space-y-0">
              {activities.map((act, i) => {
                const typeIcons: Record<string, string> = {
                  email_sent:'📤', email_opened:'👁️', email_clicked:'🖱️',
                  reply_received:'💬', info_requested:'❓',
                  appointment_scheduled:'📅', campaign_enrolled:'➕',
                };
                return (
                  <div key={act.id} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm">{typeIcons[act.type] || '📌'}</span>
                      {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div>
                      <p className="text-[13px] text-slate-700">{act.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(act.timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
