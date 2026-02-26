'use client';

import { useToast } from '@/lib/context/ToastContext';

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <span>{toast.type === 'success' ? '\u2713' : '\u2717'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
