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
    // Convert plain text to basic HTML
    return substituted
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }, [body, bodyFormat]);

  return (
    <div className="flex flex-col h-full">
      {/* View toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Preview</span>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => setView('desktop')}
            className={`p-1.5 rounded-md transition-colors ${view === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}
            title="Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`p-1.5 rounded-md transition-colors ${view === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Email chrome */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
        <div className={`mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all ${
          view === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Email header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                FFA
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{fromName}</p>
                <p className="text-xs text-slate-400">&lt;{fromEmail}&gt;</p>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">{renderedSubject}</h3>
            {previewText && (
              <p className="text-xs text-slate-400 mt-1 truncate">{replaceTokens(previewText)}</p>
            )}
          </div>

          {/* Email body */}
          <div
            className="p-4 md:p-6 text-sm text-slate-700 leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:ml-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_img]:max-w-full [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />

          {/* Email footer */}
          <div className="px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-[8px]">
                FFA
              </div>
              <span className="text-xs font-semibold text-slate-500">Florida Financial Advisors</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This email was sent by FFA North. If you no longer wish to receive these emails, click here to unsubscribe.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              1234 Main Street, Suite 100, Tampa, FL 33602
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
