'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ModalState {
  enrollModal: { contactId?: string; contactIds?: string[] } | null;
  assignModal: { contactId: string } | null;
  scheduleModal: { contactId: string } | null;
}

interface ModalContextType extends ModalState {
  openEnrollModal: (contactId?: string, contactIds?: string[]) => void;
  openAssignModal: (contactId: string) => void;
  openScheduleModal: (contactId: string) => void;
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

  const openEnrollModal = useCallback((contactId?: string, contactIds?: string[]) => {
    setEnrollModal({ contactId, contactIds });
  }, []);

  const openAssignModal = useCallback((contactId: string) => {
    setAssignModal({ contactId });
  }, []);

  const openScheduleModal = useCallback((contactId: string) => {
    setScheduleModal({ contactId });
  }, []);

  const closeAll = useCallback(() => {
    setEnrollModal(null);
    setAssignModal(null);
    setScheduleModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{
      enrollModal, assignModal, scheduleModal,
      openEnrollModal, openAssignModal, openScheduleModal, closeAll,
    }}>
      {children}
    </ModalContext.Provider>
  );
}
