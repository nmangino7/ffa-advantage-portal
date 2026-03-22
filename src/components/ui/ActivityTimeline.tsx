'use client';

import type { Activity } from '@/lib/types';
import {
  Mail, MailOpen, MousePointerClick, MessageCircle, FileText,
  CalendarDays, ArrowRightCircle, UserPlus, Phone, StickyNote, Clock,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const ACTIVITY_CONFIG: Record<string, { icon: typeof Mail; color: string; bg: string; label: string }> = {
  email_sent: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Email Sent' },
  email_opened: { icon: MailOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Email Opened' },
  email_clicked: { icon: MousePointerClick, color: 'text-violet-600', bg: 'bg-violet-100', label: 'Link Clicked' },
  reply_received: { icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Reply Received' },
  info_requested: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Info Requested' },
  appointment_scheduled: { icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Appointment Scheduled' },
  stage_changed: { icon: ArrowRightCircle, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Stage Changed' },
  campaign_enrolled: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Campaign Enrolled' },
  call_completed: { icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Call Completed' },
  note_added: { icon: StickyNote, color: 'text-neutral-600', bg: 'bg-neutral-100', label: 'Note Added' },
};

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ActivityTimeline({ activities, maxItems = 50 }: ActivityTimelineProps) {
  const sorted = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
        <p className="text-sm text-neutral-400">No activity yet</p>
      </div>
    );
  }

  // Group by date
  const grouped = new Map<string, Activity[]>();
  for (const act of sorted) {
    const dateKey = new Date(act.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(act);
  }

  return (
    <div className="relative">
      {Array.from(grouped.entries()).map(([dateKey, dayActivities], groupIdx) => (
        <div key={dateKey} className={groupIdx > 0 ? 'mt-6' : ''}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              {dateKey}
            </span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          {/* Timeline items */}
          <div className="relative ml-4">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-neutral-200 to-transparent" />

            {dayActivities.map((activity, idx) => {
              const config = ACTIVITY_CONFIG[activity.type] || {
                icon: Clock,
                color: 'text-neutral-500',
                bg: 'bg-neutral-100',
                label: activity.type,
              };
              const IconComp = config.icon;

              return (
                <div
                  key={activity.id}
                  className={`relative flex gap-4 pb-5 last:pb-0 animate-fade-up`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Icon dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 ring-4 ring-white`}>
                    <IconComp className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex-shrink-0" title={formatDate(activity.timestamp)}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {activity.description}
                    </p>
                    {activity.campaignName && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {activity.campaignName}
                      </span>
                    )}
                    {activity.emailSubject && (
                      <p className="mt-1 text-xs text-neutral-400 italic truncate">
                        &ldquo;{activity.emailSubject}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
