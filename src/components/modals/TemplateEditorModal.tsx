'use client';

import { useState, useRef, useEffect } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINES, SERVICE_LINE_CONFIG, type ServiceLine } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { X, Sparkles, Eye, FileText } from 'lucide-react';

const TOKENS = [
  { token: '{{first_name}}', label: 'First Name' },
  { token: '{{last_name}}', label: 'Last Name' },
  { token: '{{company}}', label: 'Company' },
  { token: '{{email}}', label: 'Email' },
];

export function TemplateEditorModal() {
  const { templateModal, closeAll } = useModal();
  const { customTemplates, addTemplate, updateTemplate } = usePortal();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [body, setBody] = useState('');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('Insurance Review');
  const [sendDay, setSendDay] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (templateModal?.mode === 'edit' && templateModal.templateId) {
      const t = customTemplates.find(t => t.id === templateModal.templateId);
      if (t) {
        setSubject(t.subject);
        setPreviewText(t.previewText);
        setBody(t.body);
        setSendDay(t.sendDay);
      }
    } else {
      setSubject('');
      setPreviewText('');
      setBody('');
      setSendDay(1);
      setShowPreview(false);
    }
  }, [templateModal, customTemplates]);

  if (!templateModal) return null;

  function insertToken(token: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newBody = body.slice(0, start) + token + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  function handleSave() {
    if (!subject.trim() || !body.trim()) return;

    if (templateModal!.mode === 'edit' && templateModal!.templateId) {
      updateTemplate(templateModal!.templateId, {
        subject: subject.trim(),
        previewText: previewText.trim(),
        body: body.trim(),
        sendDay,
      });
      showToast('Template updated successfully');
    } else {
      addTemplate({
        id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        subject: subject.trim(),
        previewText: previewText.trim() || subject.trim(),
        body: body.trim(),
        sendDay,
        status: 'draft',
      });
      showToast('Template created successfully');
    }
    closeAll();
  }

  function handleClose() {
    setSubject('');
    setPreviewText('');
    setBody('');
    setSendDay(1);
    setShowPreview(false);
    closeAll();
  }

  function renderPreviewBody(text: string) {
    return text
      .replace(/\{\{first_name\}\}/g, 'John')
      .replace(/\{\{last_name\}\}/g, 'Smith')
      .replace(/\{\{company\}\}/g, 'Acme Financial')
      .replace(/\{\{email\}\}/g, 'john.smith@acme.com');
  }

  const cfg = SERVICE_LINE_CONFIG[serviceLine];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {templateModal.mode === 'edit' ? 'Edit Template' : 'Create Email Template'}
              </h2>
              <p className="text-xs text-slate-500">Build a compliance-safe email template with personalization tokens</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-slate-100 min-h-[500px]">
            {/* Editor Panel */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Line</label>
                  <select value={serviceLine} onChange={e => setServiceLine(e.target.value as ServiceLine)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {SERVICE_LINES.map(sl => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Send Day</label>
                  <input type="number" value={sendDay} onChange={e => setSendDay(Number(e.target.value))} min={1} max={30}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject Line</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g., Is your coverage keeping up with your life?"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preview Text</label>
                <input type="text" value={previewText} onChange={e => setPreviewText(e.target.value)}
                  placeholder="Shown in inbox preview (optional)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Body</label>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] text-slate-400 font-medium">Insert personalization:</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TOKENS.map(t => (
                    <button key={t.token} onClick={() => insertToken(t.token)}
                      className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-mono font-semibold hover:bg-amber-100 transition-colors">
                      {t.token}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={`Hi {{first_name}},\n\nI noticed that your policy at {{company}} might benefit from a review...\n\nWould you be open to a quick 15-minute conversation?\n\nBest,\nThe FFA North Team`}
                  rows={12}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="p-6 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                    <Icon name={cfg.icon} className="w-3 h-3 inline mr-0.5" />
                    {cfg.short}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-semibold">Day {sendDay}</span>
                </div>
              </div>

              {/* Email Chrome */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Email Header */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-12">From</span>
                    <span className="text-slate-700">FFA North Team &lt;outreach@ffanorth.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-12">To</span>
                    <span className="text-slate-700">John Smith &lt;john.smith@acme.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-12">Subject</span>
                    <span className="text-slate-900 font-semibold">{subject || 'Your subject line here...'}</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="px-4 py-4">
                  {body ? (
                    <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {renderPreviewBody(body)}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Start typing to see your email preview...</p>
                  )}
                </div>

                {/* Email Footer */}
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">
                    Florida Financial Advisors &bull; 123 Main St, Suite 100, Jacksonville, FL &bull; <span className="text-blue-500 underline">Unsubscribe</span>
                  </p>
                </div>
              </div>

              {/* Token Preview Legend */}
              {body && body.includes('{{') && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-[10px] font-semibold text-amber-800 mb-1">Personalization Preview</p>
                  <p className="text-[10px] text-amber-700">Tokens auto-fill with each contact&apos;s real data when sent. Preview shows sample values.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-400">
            {subject.length > 0 ? `Subject: ${subject.length} chars` : ''} {body.length > 0 ? ` \u2022 Body: ${body.length} chars` : ''}
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!subject.trim() || !body.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40">
              {templateModal.mode === 'edit' ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
