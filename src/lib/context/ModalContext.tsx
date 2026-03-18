'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface ModalState {
  enrollModal: { contactId?: string; contactIds?: string[] } | null;
  assignModal: { contactId: string } | null;
  scheduleModal: { contactId: string } | null;
  templateModal: { mode: 'create' | 'edit'; templateId?: string; campaignId?: string } | null;
  sendTestModal: { campaignId: string } | null;
  confirmDialog: ConfirmConfig | null;
  importModal: boolean;
}

interface ModalContextType extends ModalState {
  openEnrollModal: (contactId?: string, contactIds?: string[]) => void;
  openAssignModal: (contactId: string) => void;
  openScheduleModal: (contactId: string) => void;
  openTemplateModal: (mode: 'create' | 'edit', templateId?: string, campaignId?: string) => void;
  openSendTestModal: (campaignId: string) => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  openConfirmDialog: (config: ConfirmConfig) => void;
  closeConfirmDialog: () => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [enrollModal, setEnrollModal] = useState<ModalState['enrollModal']>(null);
  const [assignModal, setAssignModal] = useState<ModalState['assignModal']>(null);
  const [scheduleModal, setScheduleModal] = useState<ModalState['scheduleModal']>(null);
  const [templateModal, setTemplateModal] = useState<ModalState['templateModal']>(null);
  const [sendTestModal, setSendTestModal] = useState<ModalState['sendTestModal']>(null);
  const [confirmDialog, setConfirmDialog] = useState<ModalState['confirmDialog']>(null);
  const [importModal, setImportModal] = useState(false);

  const openEnrollModal = useCallback((contactId?: string, contactIds?: string[]) => {
    setEnrollModal({ contactId, contactIds });
  }, []);

  const openAssignModal = useCallback((contactId: string) => {
    setAssignModal({ contactId });
  }, []);

  const openScheduleModal = useCallback((contactId: string) => {
    setScheduleModal({ contactId });
  }, []);

  const openTemplateModal = useCallback((mode: 'create' | 'edit', templateId?: string, campaignId?: string) => {
    setTemplateModal({ mode, templateId, campaignId });
  }, []);

  const openSendTestModal = useCallback((campaignId: string) => {
    setSendTestModal({ campaignId });
  }, []);

  const openImportModal = useCallback(() => {
    setImportModal(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setImportModal(false);
  }, []);

  const openConfirmDialog = useCallback((config: ConfirmConfig) => {
    setConfirmDialog(config);
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const closeAll = useCallback(() => {
    setEnrollModal(null);
    setAssignModal(null);
    setScheduleModal(null);
    setTemplateModal(null);
    setSendTestModal(null);
    setConfirmDialog(null);
    setImportModal(false);
  }, []);

  return (
    <ModalContext.Provider value={{
      enrollModal, assignModal, scheduleModal, templateModal, sendTestModal, confirmDialog, importModal,
      openEnrollModal, openAssignModal, openScheduleModal, openTemplateModal, openSendTestModal,
      openImportModal, closeImportModal,
      openConfirmDialog, closeConfirmDialog, closeAll,
    }}>
      {children}
    </ModalContext.Provider>
  );
}
