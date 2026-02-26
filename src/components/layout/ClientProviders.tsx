'use client';

import { type ReactNode } from 'react';
import { PortalProvider } from '@/lib/context/PortalContext';
import { ModalProvider } from '@/lib/context/ModalContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { EnrollmentModal } from '@/components/modals/EnrollmentModal';
import { AssignAdvisorModal } from '@/components/modals/AssignAdvisorModal';
import { ScheduleCallModal } from '@/components/modals/ScheduleCallModal';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <ModalProvider>
        <ToastProvider>
          {children}
          <EnrollmentModal />
          <AssignAdvisorModal />
          <ScheduleCallModal />
          <ToastContainer />
        </ToastProvider>
      </ModalProvider>
    </PortalProvider>
  );
}
