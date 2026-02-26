'use client';

import { useState } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG } from '@/lib/types';

export function EnrollmentModal() {
  const { enrollModal, closeAll } = useModal();
  const { contacts, campaigns, enrollContact } = usePortal();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Enroll in Campaign</h2>
          {contact && (
            <p className="text-sm text-slate-500 mt-0.5">
              {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
            </p>
          )}
          {contactIds && contactIds.length > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{contactIds.length} contacts selected</p>
          )}
        </div>

        {/* Campaign List */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-2">
          {activeCampaigns.map(camp => {
            const cfg = SERVICE_LINE_CONFIG[camp.serviceLine];
            const isEnrolled = alreadyEnrolled.has(camp.id);
            const isSelected = selected.has(camp.id);

            return (
              <label
                key={camp.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isEnrolled
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected || isEnrolled}
                  disabled={isEnrolled}
                  onChange={() => !isEnrolled && handleToggle(camp.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xl">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{camp.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                      {cfg.short}
                    </span>
                    <span className="text-[11px] text-slate-400">{camp.enrolledCount} enrolled</span>
                    {isEnrolled && <span className="text-[10px] text-slate-400 italic">(Already enrolled)</span>}
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>{camp.status}</span>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleEnroll} disabled={selected.size === 0}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Enroll in {selected.size} Campaign{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
