'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

export function EnrollmentModal() {
  const { enrollModal, closeAll } = useModal();
  const { contacts, campaigns, enrollContact } = usePortal();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (enrollModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [enrollModal, handleEscape]);

  if (!enrollModal) return null;

  const contactId = enrollModal.contactId;
  const contactIds = enrollModal.contactIds;
  const contact = contactId ? contacts.find(c => c.id === contactId) : null;
  const alreadyEnrolled = contact ? new Set(contact.campaigns) : new Set<string>();
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'draft');

  function handleToggle(campId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(campId)) next.delete(campId);
      else next.add(campId);
      return next;
    });
  }

  function handleEnroll() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    if (contactId) {
      enrollContact(contactId, ids);
      const campNames = ids.map(id => campaigns.find(c => c.id === id)?.name).filter(Boolean);
      showToast(`${contact?.firstName} ${contact?.lastName} enrolled in ${campNames.join(', ')}`);
    } else if (contactIds && contactIds.length > 0) {
      for (const cid of contactIds) {
        enrollContact(cid, ids);
      }
      showToast(`${contactIds.length} contacts enrolled in ${ids.length} campaign(s)`);
    }

    setSelected(new Set());
    closeAll();
  }

  function handleClose() {
    setSelected(new Set());
    closeAll();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Enroll in Campaign</h2>
          {contact && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
            </p>
          )}
          {contactIds && contactIds.length > 0 && (
            <p className="text-sm text-neutral-500 mt-0.5">{contactIds.length} contacts selected</p>
          )}
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-1.5">
          {activeCampaigns.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-500 mb-1">No active or draft campaigns available.</p>
              <p className="text-xs text-neutral-400">Create a campaign first, then enroll contacts.</p>
            </div>
          )}
          {activeCampaigns.map(camp => {
            const cfg = SERVICE_LINE_CONFIG[camp.serviceLine];
            const isEnrolled = alreadyEnrolled.has(camp.id);
            const isSelected = selected.has(camp.id);

            return (
              <label
                key={camp.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isEnrolled
                    ? 'bg-neutral-50 border-neutral-200 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected || isEnrolled}
                  disabled={isEnrolled}
                  onChange={() => !isEnrolled && handleToggle(camp.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                  <Icon name={cfg.icon} className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{camp.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.short}</span>
                    <span className="text-[11px] text-neutral-400">{camp.enrolledCount} enrolled</span>
                    {isEnrolled && <span className="text-[10px] text-neutral-400 italic">(Already enrolled)</span>}
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  camp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                }`}>{camp.status}</span>
              </label>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={handleClose} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleEnroll} disabled={selected.size === 0}
            className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Enroll in {selected.size} Campaign{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
