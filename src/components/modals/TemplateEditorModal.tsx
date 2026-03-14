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
      showToast('Template updated');
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
      showToast('Template created');
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
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">
                {templateModal.mode === 'edit' ? 'Edit Template' : 'Create Email Template'}
              </h2>
              <p className="text-xs text-neutral-400">Build a compliance-safe email with rich formatting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
              <Icon name={cfg.icon} className="w-3 h-3 inline mr-0.5" />
              {cfg.short}
            </span>
            <button onClick={handleClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-neutral-100 h-full">
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Service Line</label>
                  <select value={serviceLine} onChange={e => setServiceLine(e.target.value as ServiceLine)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {SERVICE_LINES.map(sl => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Send Day</label>
                  <input type="number" value={sendDay} onChange={e => setSendDay(Number(e.target.value))} min={1} max={30}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Subject Line</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g., Is your coverage keeping up with your life?"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Preview Text</label>
                <input type="text" value={previewText} onChange={e => setPreviewText(e.target.value)}
                  placeholder="Shown in inbox preview (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email Body</label>
                <RichTextEditor
                  initialContent={body}
                  onChange={setBody}
                  placeholder="Start writing your email..."
                  minHeight="250px"
                />
              </div>
            </div>

            <div className="overflow-hidden flex flex-col">
              <EmailPreview subject={subject} previewText={previewText} body={body} bodyFormat="html" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {subject.length > 0 ? `Subject: ${subject.length} chars` : ''}
          </p>
          <div className="flex gap-2">
            <button onClick={handleClose} className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!subject.trim() || !body.trim()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40">
              {templateModal.mode === 'edit' ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
