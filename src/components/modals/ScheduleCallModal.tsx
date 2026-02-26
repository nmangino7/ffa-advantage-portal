'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Schedule Call</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {contact.firstName} {contact.lastName} {contact.company ? `\u2022 ${contact.company}` : ''}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add call agenda or notes..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSchedule}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );
}
