'use client';

import { useState, useMemo } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useContent } from '@/lib/context/ContentContext';
import { useToast } from '@/lib/context/ToastContext';
import { Sparkles, Mail, FileText, ShieldCheck } from 'lucide-react';
import { EmailGenerator } from '@/components/ai/EmailGenerator';
import { NewsletterGenerator } from '@/components/ai/NewsletterGenerator';
import { ComplianceReview } from '@/components/ai/ComplianceReview';
import type { AIEmailResponse } from '@/lib/ai-types';

type StudioTab = 'email' | 'newsletter' | 'compliance';

const TABS: { key: StudioTab; label: string; icon: typeof Mail }[] = [
  { key: 'email', label: 'Generate Email', icon: Mail },
  { key: 'newsletter', label: 'Create Newsletter', icon: FileText },
  { key: 'compliance', label: 'Compliance Review', icon: ShieldCheck },
];

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>('email');
  const { campaigns, customTemplates, addTemplate } = usePortal();
  const { uploadFile } = useContent();
  const { showToast } = useToast();

  // Build template options for compliance review
  const templateOptions = useMemo(() => {
    const options: Array<{ id: string; subject: string; body: string; campaignName?: string }> = [];
    for (const campaign of campaigns) {
      for (const step of campaign.emailSequence) {
        options.push({
          id: step.id,
          subject: step.subject,
          body: step.body,
          campaignName: campaign.name,
        });
      }
    }
    for (const tpl of customTemplates) {
      options.push({
        id: tpl.id,
        subject: tpl.subject,
        body: tpl.body,
        campaignName: 'Custom Template',
      });
    }
    return options;
  }, [campaigns, customTemplates]);

  function handleSaveTemplate(email: AIEmailResponse) {
    addTemplate({
      id: `tpl-ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      subject: email.subject,
      previewText: email.previewText,
      body: email.body,
      bodyFormat: 'html',
      sendDay: 1,
      status: 'draft',
    });
    showToast('Template saved to Content Library');
  }

  async function handleSaveNewsletter(title: string, pdfBlob: Blob) {
    const file = new File([pdfBlob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, {
      type: 'application/pdf',
    });
    await uploadFile(file);
    showToast('Newsletter PDF saved to Content Library');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center animate-sparkle">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">AI Studio</h1>
            <p className="text-sm text-neutral-500">
              Generate FINRA-compliant emails, newsletters, and run compliance audits
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:shadow-sm'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'email' && (
        <EmailGenerator onSaveTemplate={handleSaveTemplate} />
      )}
      {activeTab === 'newsletter' && (
        <NewsletterGenerator onSaveToLibrary={handleSaveNewsletter} />
      )}
      {activeTab === 'compliance' && (
        <ComplianceReview templates={templateOptions} />
      )}
    </div>
  );
}
