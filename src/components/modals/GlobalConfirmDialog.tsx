'use client';

import { useModal } from '@/lib/context/ModalContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function GlobalConfirmDialog() {
  const { confirmDialog, closeConfirmDialog } = useModal();
  if (!confirmDialog) return null;

  return (
    <ConfirmDialog
      title={confirmDialog.title}
      message={confirmDialog.message}
      confirmLabel={confirmDialog.confirmLabel}
      cancelLabel={confirmDialog.cancelLabel}
      destructive={confirmDialog.destructive}
      onConfirm={() => {
        confirmDialog.onConfirm();
        closeConfirmDialog();
      }}
      onCancel={closeConfirmDialog}
    />
  );
}
