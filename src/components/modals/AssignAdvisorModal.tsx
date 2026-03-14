'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';

const ADVISORS = [
  'Nick Mangino', 'Sarah Mitchell', 'David Torres',
  'Jennifer Clark', 'Michael Adams', 'Lisa Thompson', 'Robert Green',
];

export function AssignAdvisorModal() {
  const { assignModal, closeAll } = useModal();
  const { contacts, assignAdvisor } = usePortal();
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
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Assign Advisor</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
          </p>
        </div>

        <div className="px-6 py-4 space-y-1.5">
          {ADVISORS.map(advisor => {
            const initials = advisor.split(' ').map(n => n[0]).join('');
            const isSelected = selectedAdvisor === advisor;
            const isCurrent = contact.assignedRep === advisor;

            return (
              <label
                key={advisor}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-200'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="advisor"
                  checked={isSelected || isCurrent}
                  onChange={() => setSelectedAdvisor(advisor)}
                  className="w-4 h-4 border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
                  {initials}
                </div>
                <span className="text-sm font-medium text-neutral-900 flex-1">{advisor}</span>
                {isCurrent && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                    Current
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={handleClose} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={!selectedAdvisor}
            className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Assign {selectedAdvisor || 'Advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}
