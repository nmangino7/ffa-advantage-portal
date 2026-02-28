'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINES, SERVICE_LINE_CONFIG, type ServiceLine } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { EmailPreview } from '@/components/ui/EmailPreview';
import { X, FileText } from 'lucide-react';

export function TemplateEditorModal() {
  const { templateModal, closeAll } = useModal();
  const { customTemplates, addTemplate, updateTemplate } = usePortal();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [body, setBody] = useState('');
  const [serviceLine, setServiceLine] = useState<ServiceLine>('Insurance Review');
  const [sendDay, setSendDay] = useState(1);

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
    }
  }, [templateModal, customTemplates]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  }, [closeAll]);

  useEffect(() => {
    if (templateModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [templateModal, handleEscape]);

  if (!templateModal) return null;

  function handleSave() {
    if (!subject.trim() || !body.trim()) return;

    if (templateModal!.mode === 'edit' && templateModal!.templateId) {
      updateTemplate(templateModal!.templateId, {
        subject: subject.trim(),
        previewText: previewText.trim(),
        body: body.trim(),
        bodyFormat: 'html',
        sendDay,
      });
      showToast('Template updated successfully');
    } else {
      addTemplate({
        id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        subject: subject.trim(),
        previewText: previewText.trim() || subject.trim(),
        body: body.trim(),
        bodyFormat: 'html',
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
    closeAll();
  }

  const cfg = SERVICE_LINE_CONFIG[serviceLine];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
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
              <p className="text-xs text-slate-500">Build a compliance-safe email with rich formatting and personalization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
              <Icon name={cfg.icon} className="w-3 h-3 inline mr-0.5" />
              {cfg.short}
            </span>
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-100 h-full">
            {/* Editor Panel */}
            <div className="overflow-y-auto p-6 space-y-4">
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Body</label>
                <RichTextEditor
                  initialContent={body}
                  onChange={setBody}
                  placeholder="Start writing your email..."
                  minHeight="250px"
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="overflow-hidden flex flex-col">
              <EmailPreview
                subject={subject}
                previewText={previewText}
                body={body}
                bodyFormat="html"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-400">
            {subject.length > 0 ? `Subject: ${subject.length} chars` : ''}
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
