'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { useModal } from '@/lib/context/ModalContext';
import { PIPELINE_STAGES, SERVICE_LINE_CONFIG } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { BarChart3, Send, Eye, MousePointerClick, MessageSquare, HelpCircle, CalendarDays, Plus, FileText, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

type TabKey = 'activity' | 'campaigns' | 'engagement';

export default function AudienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { contacts, campaigns, activities } = usePortal();
  const { openEnrollModal, openAssignModal, openScheduleModal } = useModal();
  const [activeTab, setActiveTab] = useState<TabKey>('activity');

  const contact = contacts.find(c => c.id === id);
  if (!contact) return <div className="max-w-7xl mx-auto px-6 py-8 text-center text-neutral-400">Contact not found</div>;

  const contactCampaigns = campaigns.filter(c => contact.campaigns.includes(c.id));
  const contactActivities = activities.filter(a => a.contactId === id).slice(0, 50);
  const stageMeta = PIPELINE_STAGES.find(s => s.key === contact.stage);
  const daysSince = Math.floor((Date.now() - new Date(contact.lastContactDate).getTime()) / 86400000);
  const stageIndex = PIPELINE_STAGES.findIndex(s => s.key === contact.stage);

  const engagement = useMemo(() => {
    const ca = activities.filter(a => a.contactId === id);
    return {
      totalActions: ca.length,
      emailsSent: ca.filter(a => a.type === 'email_sent').length,
      emailsOpened: ca.filter(a => a.type === 'email_opened').length,
      emailsClicked: ca.filter(a => a.type === 'email_clicked').length,
      replies: ca.filter(a => a.type === 'reply_received').length,
      infoRequests: ca.filter(a => a.type === 'info_requested').length,
      appointments: ca.filter(a => a.type === 'appointment_scheduled').length,
    };
  }, [activities, id]);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'activity', label: 'Activity', count: contactActivities.length },
    { key: 'campaigns', label: 'Campaigns', count: contactCampaigns.length },
    { key: 'engagement', label: 'Engagement' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.company || undefined}
        breadcrumbs={[
          { label: 'Audience', href: '/audience' },
          { label: `${contact.firstName} ${contact.lastName}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mb-3"
                style={{ backgroundColor: stageMeta?.color || '#94a3b8' }}>
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">{contact.firstName} {contact.lastName}</h2>
              {contact.company && <p className="text-sm text-neutral-500">{contact.company}</p>}
            </div>

            {/* Info Fields */}
            <div className="space-y-4 border-t border-neutral-100 pt-4">
              <InfoField label="Email" value={contact.email} />
              <InfoField label="Phone" value={contact.phone} />
              <InfoField label="Stage">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                  style={{ backgroundColor: stageMeta?.bgColor || '#f1f5f9', color: stageMeta?.color || '#64748b' }}>
                  {stageMeta && <Icon name={stageMeta.icon} className="w-3 h-3" />} {stageMeta?.label}
                </span>
              </InfoField>
              <InfoField label="Intent Score">
                <span className={`text-sm font-semibold ${contact.intentScore >= 70 ? 'text-emerald-600' : contact.intentScore >= 30 ? 'text-amber-600' : 'text-neutral-400'}`}>
                  {contact.intentScore}/100
                </span>
              </InfoField>
              {contact.assignedRep && <InfoField label="Assigned Rep" value={contact.assignedRep} />}
              <InfoField label="Days Since Contact">
                <span className={`text-sm ${daysSince > 180 ? 'text-red-500 font-semibold' : daysSince > 90 ? 'text-amber-500 font-semibold' : 'text-neutral-900'}`}>
                  {daysSince > 365 ? `${Math.floor(daysSince / 365)}y ${daysSince % 365}d` : `${daysSince} days`}
                </span>
              </InfoField>
              <InfoField label="In Database Since" value={new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
              {contact.notes && (
                <div className="pt-3 border-t border-neutral-100">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">Notes</p>
                  <p className="text-sm text-neutral-700">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Pipeline Progress */}
            <div className="border-t border-neutral-100 pt-4 mt-4">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mb-2">Pipeline Position</p>
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
                  <span key={s.key} className={`text-[9px] inline-flex items-center gap-0.5 ${i <= stageIndex ? 'font-semibold' : 'text-neutral-300'}`}
                    style={i <= stageIndex ? { color: s.color } : {}}>
                    <Icon name={s.icon} className="w-2.5 h-2.5" /> {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-neutral-100 pt-4 mt-4 space-y-2">
              <button onClick={() => openEnrollModal(contact.id)}
                className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
                Enroll in Campaign
              </button>
              <button onClick={() => openAssignModal(contact.id)}
                className="w-full px-4 py-2.5 text-sm font-semibold border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
                Assign Advisor
              </button>
              <button onClick={() => openScheduleModal(contact.id)}
                className="w-full px-4 py-2.5 text-sm font-semibold border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
                Schedule Call
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="lg:col-span-2">
          {/* Tab Strip */}
          <div className="flex items-center gap-1 border-b border-neutral-200 mb-6">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-100 text-neutral-400'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Activity Timeline</h3>
              {contactActivities.length > 0 ? (
                <div className="space-y-0">
                  {contactActivities.map((act, i) => {
                    const typeConfig: Record<string, { iconName: string; color: string; bg: string }> = {
                      email_sent: { iconName: 'send', color: '#6366f1', bg: '#eef2ff' },
                      email_opened: { iconName: 'eye', color: '#06b6d4', bg: '#ecfeff' },
                      email_clicked: { iconName: 'mouse-click', color: '#d97706', bg: '#fffbeb' },
                      reply_received: { iconName: 'message-square', color: '#059669', bg: '#ecfdf5' },
                      info_requested: { iconName: 'help-circle', color: '#7c3aed', bg: '#f5f3ff' },
                      appointment_scheduled: { iconName: 'calendar', color: '#dc2626', bg: '#fef2f2' },
                      campaign_enrolled: { iconName: 'plus', color: '#6366f1', bg: '#eef2ff' },
                      note_added: { iconName: 'file-text', color: '#64748b', bg: '#f8fafc' },
                      stage_changed: { iconName: 'trending-up', color: '#7c3aed', bg: '#f5f3ff' },
                    };
                    const tc = typeConfig[act.type] || { iconName: 'clock', color: '#64748b', bg: '#f8fafc' };
                    const isHighValue = ['reply_received', 'info_requested', 'appointment_scheduled'].includes(act.type);

                    return (
                      <div key={act.id} className={`flex gap-3 pb-4 ${isHighValue ? 'bg-amber-50/30 -mx-2 px-2 rounded-lg' : ''}`}>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: tc.bg, color: tc.color }}>
                            <Icon name={tc.iconName} className="w-3.5 h-3.5" />
                          </div>
                          {i < contactActivities.length - 1 && <div className="w-px flex-1 bg-neutral-200 mt-1" />}
                        </div>
                        <div className="pt-0.5 flex-1 min-w-0">
                          <p className={`text-[13px] ${isHighValue ? 'text-neutral-900 font-semibold' : 'text-neutral-700'}`}>{act.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-neutral-400">
                              {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                            {act.campaignName && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">{act.campaignName}</span>
                            )}
                          </div>
                          {act.emailBody && (
                            <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                              {act.emailSubject && (
                                <p className="text-[11px] font-semibold text-neutral-700 mb-1">{act.emailSubject}</p>
                              )}
                              <p className="text-[12px] text-neutral-600 leading-relaxed">{act.emailBody}</p>
                              <p className="text-[10px] text-neutral-400 mt-2">From: {contact.firstName} {contact.lastName} &lt;{contact.email}&gt;</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No activity yet</p>
                </div>
              )}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Campaigns</h3>
              {contactCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {contactCampaigns.map(camp => {
                    const campCfg = SERVICE_LINE_CONFIG[camp.serviceLine];
                    return (
                      <Link key={camp.id} href={`/campaigns/${camp.id}`}
                        className="block p-4 rounded-xl border border-neutral-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: campCfg.bgColor, color: campCfg.color }}>
                            <Icon name={campCfg.icon} className="w-5 h-5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-neutral-900">{camp.name}</p>
                            <p className="text-[11px] text-neutral-400">{camp.serviceLine}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${camp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                            {camp.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {camp.emailSequence.map((step) => (
                              <div key={step.id} className="flex-1">
                                <div className="h-1.5 rounded-full" style={{ backgroundColor: step.status === 'active' ? campCfg.color : '#e5e7eb' }} />
                                <p className="text-[8px] text-neutral-400 mt-0.5 text-center">Day {step.sendDay}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3 mt-2 text-[10px] text-neutral-400">
                          <span>{camp.emailSequence.length} emails</span>
                          <span>{camp.openRate}% open</span>
                          <span>{camp.clickRate}% click</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Not enrolled in any campaigns</p>
                  <p className="text-xs text-neutral-400 mt-1">This contact is dormant</p>
                  <button onClick={() => openEnrollModal(contact.id)}
                    className="mt-3 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all">
                    Enroll in Campaign
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <EngagementBox label="Total Actions" value={engagement.totalActions} icon={<BarChart3 className="w-4 h-4" />} />
                <EngagementBox label="Emails Sent" value={engagement.emailsSent} icon={<Send className="w-4 h-4" />} />
                <EngagementBox label="Emails Opened" value={engagement.emailsOpened} icon={<Eye className="w-4 h-4" />} />
                <EngagementBox label="Links Clicked" value={engagement.emailsClicked} icon={<MousePointerClick className="w-4 h-4" />} />
                <EngagementBox label="Replies" value={engagement.replies} icon={<MessageSquare className="w-4 h-4" />} highlight />
                <EngagementBox label="Info Requests" value={engagement.infoRequests} icon={<HelpCircle className="w-4 h-4" />} highlight />
                <EngagementBox label="Appointments" value={engagement.appointments} icon={<CalendarDays className="w-4 h-4" />} highlight />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EngagementBox({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 text-center">
      <div className={`flex justify-center mb-1.5 ${highlight ? 'text-amber-500' : 'text-neutral-400'}`}>{icon}</div>
      <p className={`text-2xl font-semibold ${highlight ? 'text-amber-600' : 'text-neutral-900'}`}>{value}</p>
      <p className="text-[10px] text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}

function InfoField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">{label}</p>
      {children || <p className="text-sm text-neutral-900">{value}</p>}
    </div>
  );
}
