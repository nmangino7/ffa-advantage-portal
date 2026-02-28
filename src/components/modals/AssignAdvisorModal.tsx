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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Assign Advisor</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
          </p>
        </div>

        {/* Advisor List */}
        <div className="px-6 py-4 space-y-2">
          {ADVISORS.map(advisor => {
            const initials = advisor.split(' ').map(n => n[0]).join('');
            const isSelected = selectedAdvisor === advisor;
            const isCurrent = contact.assignedRep === advisor;

            return (
              <label
                key={advisor}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-200'
                    : isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <input
                  type="radio"
                  name="advisor"
                  checked={isSelected || isCurrent}
                  onChange={() => setSelectedAdvisor(advisor)}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-900">{advisor}</span>
                {isCurrent && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold ml-auto">
                    Current
                  </span>
                )}
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
          <button onClick={handleAssign} disabled={!selectedAdvisor}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Assign {selectedAdvisor || 'Advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}
