'use client';

import { useState, useMemo } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface EmailPreviewProps {
  subject: string;
  previewText?: string;
  body: string;
  bodyFormat?: 'html' | 'text';
  fromName?: string;
  fromEmail?: string;
}

const SAMPLE_DATA: Record<string, string> = {
  '{{first_name}}': 'James',
  '{{last_name}}': 'Wilson',
  '{{full_name}}': 'James Wilson',
  '{{company}}': 'Pinnacle Services',
  '{{email}}': 'james.wilson@gmail.com',
};

function replaceTokens(text: string): string {
  return text.replace(/\{\{[^}]+\}\}/g, match => SAMPLE_DATA[match] || match);
}

export function EmailPreview({
  subject,
  previewText,
  body,
  bodyFormat = 'text',
  fromName = 'FFA North Team',
  fromEmail = 'outreach@ffanorth.com',
}: EmailPreviewProps) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

  const renderedSubject = useMemo(() => replaceTokens(subject || '(No Subject)'), [subject]);
  const renderedBody = useMemo(() => {
    const substituted = replaceTokens(body);
    if (bodyFormat === 'html') return substituted;
    return substituted
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }, [body, bodyFormat]);

  return (
    <div className="flex flex-col h-full">
      {/* View toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-neutral-50">
        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Preview</span>
        <div className="flex items-center gap-0.5 bg-white border border-neutral-200 rounded-lg p-0.5">
          <button
            onClick={() => setView('desktop')}
            className={`p-1.5 rounded transition-colors ${view === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`p-1.5 rounded transition-colors ${view === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Email chrome */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
        <div className={`mx-auto bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all ${
          view === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                FFA
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">{fromName}</p>
                <p className="text-xs text-neutral-400">&lt;{fromEmail}&gt;</p>
              </div>
            </div>
            <h3 className="text-base font-semibold text-neutral-900 leading-tight">{renderedSubject}</h3>
            {previewText && (
              <p className="text-xs text-neutral-400 mt-1 truncate">{replaceTokens(previewText)}</p>
            )}
          </div>

          {/* Body */}
          <div
            className="p-4 md:p-6 text-sm text-neutral-700 leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:ml-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_a]:text-indigo-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_img]:max-w-full [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />

          {/* Footer */}
          <div className="px-4 md:px-6 py-4 border-t border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-neutral-900 flex items-center justify-center text-white font-bold text-[7px]">
                FFA
              </div>
              <span className="text-xs font-medium text-neutral-500">Florida Financial Advisors</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              This email was sent by FFA North. If you no longer wish to receive these emails, click here to unsubscribe.
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              1234 Main Street, Suite 100, Tampa, FL 33602
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
