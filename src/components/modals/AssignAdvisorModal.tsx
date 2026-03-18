'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { CheckCircle2, AlertTriangle, Mail, Phone, Users } from 'lucide-react';

export function AssignAdvisorModal() {
  const { assignModal, closeAll } = useModal();
  const { contacts, advisors, assignAdvisor } = usePortal();
  const { showToast } = useToast();
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (assignModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [assignModal, handleEscape]);

  if (!assignModal) return null;

  const contact = contacts.find(c => c.id === assignModal.contactId);
  if (!contact) return null;

  const selectedAdvisorData = advisors.find(a => `${a.firstName} ${a.lastName}` === selectedAdvisor);

  // Calculate live assigned counts from contacts
  const assignedCounts: Record<string, number> = {};
  for (const a of advisors) {
    const fullName = `${a.firstName} ${a.lastName}`;
    assignedCounts[fullName] = contacts.filter(c => c.assignedRep === fullName).length;
  }

  function handleAssign() {
    if (!selectedAdvisor) return;
    assignAdvisor(assignModal!.contactId, selectedAdvisor);
    showToast(`${selectedAdvisor} assigned to ${contact!.firstName} ${contact!.lastName}`);
    setSelectedAdvisor(null);
    closeAll();
  }

  function handleClose() {
    setSelectedAdvisor(null);
    closeAll();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-lg w-full overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Assign Advisor</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
          </p>
        </div>

        <div className="px-6 py-4 space-y-1.5 max-h-[400px] overflow-y-auto">
          {advisors.map(advisor => {
            const fullName = `${advisor.firstName} ${advisor.lastName}`;
            const initials = `${advisor.firstName[0]}${advisor.lastName[0]}`;
            const isSelected = selectedAdvisor === fullName;
            const isCurrent = contact.assignedRep === fullName;
            const isDisabled = !advisor.complianceApproved;
            const count = assignedCounts[fullName] || 0;

            return (
              <label
                key={advisor.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isDisabled
                    ? 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-emerald-50 border-emerald-200 cursor-pointer'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-300 cursor-pointer'
                    : 'border-neutral-200 hover:border-neutral-300 cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="advisor"
                  checked={isSelected || isCurrent}
                  onChange={() => !isDisabled && setSelectedAdvisor(fullName)}
                  disabled={isDisabled}
                  className="w-4 h-4 border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                />
                <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">{fullName}</span>
                    {advisor.complianceApproved ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">
                        <AlertTriangle className="w-2.5 h-2.5" /> Pending
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{advisor.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {advisor.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {advisor.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {count} assigned
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Selected advisor email display */}
        {selectedAdvisorData && (
          <div className="mx-6 mb-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-[12px] text-indigo-700 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Emails will be sent from: <span className="font-semibold">{selectedAdvisorData.email}</span>
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={handleClose} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={!selectedAdvisor}
            className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Assign {selectedAdvisor || 'Advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}
