'use client';

import { useToast } from '@/lib/context/ToastContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2.5 bg-white border border-neutral-200 rounded-lg px-4 py-3 shadow-lg animate-slide-in text-sm"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span className="text-neutral-700 flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
