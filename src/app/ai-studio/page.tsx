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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 mb-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '60px 60px, 80px 80px, 100px 100px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold">AI Studio</h1>
          </div>
          <p className="text-violet-100 text-sm max-w-lg">Generate FINRA-compliant emails, newsletters, and run compliance reviews — powered by Claude AI.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-neutral-100 p-1 rounded-xl inline-flex gap-1 mb-8">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-white text-neutral-900 shadow-md'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
              style={activeTab === tab.key ? { boxShadow: '0 2px 8px rgba(99,102,241,0.15)' } : {}}
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
