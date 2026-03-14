'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function ScheduleCallModal() {
  const { scheduleModal, closeAll } = useModal();
  const { contacts, scheduleCall } = usePortal();
  const { showToast } = useToast();
  const [date, setDate] = useState(getTomorrow());
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (scheduleModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [scheduleModal, handleEscape]);

  if (!scheduleModal) return null;

  const contact = contacts.find(c => c.id === scheduleModal.contactId);
  if (!contact) return null;

  function handleSchedule() {
    scheduleCall(scheduleModal!.contactId, date, time, notes);
    showToast(`Call scheduled with ${contact!.firstName} ${contact!.lastName} on ${date} at ${time}`);
    setDate(getTomorrow());
    setTime('10:00');
    setNotes('');
    closeAll();
  }

  function handleClose() {
    setDate(getTomorrow());
    setTime('10:00');
    setNotes('');
    closeAll();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Schedule Call</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add call agenda or notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={handleClose} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSchedule}
            className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );
}
