import { getContact, getCampaigns, getActivities } from '@/lib/data';
import { PIPELINE_STAGES } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = getContact(id);

  if (!contact) {
    notFound();
  }

  const allCampaigns = getCampaigns();
  const contactCampaigns = allCampaigns.filter(c => contact.campaigns.includes(c.id));
  const activities = getActivities(undefined, contact.id);
  const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);

  const daysSinceContact = Math.floor(
    (Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/contacts" className="hover:text-blue-600">Contacts</Link>
        <span>/</span>
        <span className="text-slate-900">{contact.firstName} {contact.lastName}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.company && (
                <p className="text-slate-500">{contact.company}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                  style={{ backgroundColor: stageMeta?.color }}
                >
                  {stageMeta?.label}
                </span>
                {contact.intentScore > 0 && (
                  <span className={`text-sm font-bold ${
                    contact.intentScore >= 70 ? 'text-emerald-600' :
                    contact.intentScore >= 30 ? 'text-amber-600' :
                    'text-slate-400'
                  }`}>
                    Intent Score: {contact.intentScore}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-400">Last contacted</p>
            <p className="text-slate-700 font-medium">
              {new Date(contact.lastContactDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className={`text-xs mt-0.5 ${daysSinceContact > 180 ? 'text-red-500' : daysSinceContact > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
              {daysSinceContact} days ago
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="Phone" value={contact.phone} />
            <InfoRow label="Company" value={contact.company || 'N/A'} />
            <InfoRow label="Assigned Rep" value={contact.assignedRep || 'Unassigned'} />
            <InfoRow
              label="Created"
              value={new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
          </div>

          {contact.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{contact.notes}</p>
            </div>
          )}
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Campaigns ({contactCampaigns.length})
          </h2>
          {contactCampaigns.length > 0 ? (
            <div className="space-y-3">
              {contactCampaigns.map(campaign => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-900">{campaign.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{campaign.serviceLine}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{campaign.openRate}% open</span>
                    <span>{campaign.clickRate}% CTR</span>
                    <span className={`${
                      campaign.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">Not enrolled in any campaigns</p>
              <p className="text-xs text-slate-300 mt-1">This contact is dormant</p>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity Timeline</h2>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      activity.type === 'appointment_scheduled' ? 'bg-emerald-500' :
                      activity.type === 'email_clicked' || activity.type === 'reply_received' ? 'bg-amber-500' :
                      activity.type === 'info_requested' ? 'bg-purple-500' :
                      'bg-blue-400'
                    }`} />
                    {i < activities.length - 1 && (
                      <div className="w-px h-full bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-slate-700">{activity.description}</p>
                    {activity.campaignName && (
                      <p className="text-xs text-blue-500 mt-0.5">{activity.campaignName}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No activity recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-900 font-medium">{value}</p>
    </div>
  );
}
