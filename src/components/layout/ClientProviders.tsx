'use client';

import { type ReactNode } from 'react';
import { PortalProvider } from '@/lib/context/PortalContext';
import { ContentProvider } from '@/lib/context/ContentContext';
import { ModalProvider } from '@/lib/context/ModalContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { EnrollmentModal } from '@/components/modals/EnrollmentModal';
import { AssignAdvisorModal } from '@/components/modals/AssignAdvisorModal';
import { ScheduleCallModal } from '@/components/modals/ScheduleCallModal';
import { TemplateEditorModal } from '@/components/modals/TemplateEditorModal';
import { GlobalConfirmDialog } from '@/components/modals/GlobalConfirmDialog';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <ContentProvider>
        <ModalProvider>
          <ToastProvider>
            {children}
            <EnrollmentModal />
            <AssignAdvisorModal />
            <ScheduleCallModal />
            <TemplateEditorModal />
            <GlobalConfirmDialog />
            <ToastContainer />
          </ToastProvider>
        </ModalProvider>
      </ContentProvider>
    </PortalProvider>
  );
}
