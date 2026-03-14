'use client';

import { useEffect, useCallback } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter') onConfirm();
  }, [onCancel, onConfirm]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div
        className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-sm w-full animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${destructive ? 'bg-red-50' : 'bg-amber-50'}`}>
              {destructive ? (
                <Trash2 className="w-4 h-4 text-red-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-500 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-neutral-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-800 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
