'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useContent } from '@/lib/context/ContentContext';
import { useModal } from '@/lib/context/ModalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG, SERVICE_LINES, type ServiceLine, type ContentTemplate } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmailPreviewCard } from '@/components/ui/EmailPreviewCard';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ContentCard } from '@/components/ui/ContentCard';
import { Icon } from '@/components/ui/Icon';
import { Plus, Search, FileText, Mail, FolderOpen } from 'lucide-react';

type ViewTab = 'files' | 'templates';

export default function ContentLibraryPage() {
  const { campaigns, customTemplates } = usePortal();
  const { files, uploadFile, removeFile, getFileUrl, getFileThumbnail } = useContent();
  const { openTemplateModal } = useModal();
  const { showToast } = useToast();

  const [viewTab, setViewTab] = useState<ViewTab>('files');
  const [serviceFilter, setServiceFilter] = useState<ServiceLine | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Generate thumbnails for image files
  useEffect(() => {
    const loadThumbnails = async () => {
      const newThumbnails: Record<string, string> = {};
      for (const file of files) {
        if (file.mimeType.startsWith('image/')) {
          const url = await getFileThumbnail(file.id);
          if (url) newThumbnails[file.id] = url;
        }
      }
      setThumbnails(newThumbnails);
    };
    loadThumbnails();
  }, [files, getFileThumbnail]);

  const allTemplates: ContentTemplate[] = useMemo(() => {
    const templates: ContentTemplate[] = [];
    for (const campaign of campaigns) {
      for (let i = 0; i < campaign.emailSequence.length; i++) {
        templates.push({
          template: campaign.emailSequence[i],
          campaignId: campaign.id,
          campaignName: campaign.name,
          serviceLine: campaign.serviceLine,
          stepNumber: i + 1,
        });
      }
    }
    // Add custom templates
    for (const tpl of customTemplates) {
      templates.push({
        template: tpl,
        campaignId: 'custom',
        campaignName: 'Custom Template',
        serviceLine: 'Insurance Review',
        stepNumber: 0,
      });
    }
    return templates;
  }, [campaigns, customTemplates]);

  const filteredTemplates = useMemo(() => {
    let result = allTemplates;
    if (serviceFilter !== 'all') result = result.filter(t => t.serviceLine === serviceFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.template.subject.toLowerCase().includes(q) ||
        t.template.previewText.toLowerCase().includes(q) ||
        t.template.body.toLowerCase().includes(q) ||
        t.campaignName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allTemplates, serviceFilter, search]);

  const filteredFiles = useMemo(() => {
    let result = files;
    if (serviceFilter !== 'all') result = result.filter(f => f.serviceLine === serviceFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }
    return result;
  }, [files, serviceFilter, search]);

  const handleUpload = useCallback(async (fileList: File[]) => {
    for (const file of fileList) {
      await uploadFile(file);
    }
    showToast(`${fileList.length} file${fileList.length > 1 ? 's' : ''} uploaded successfully`);
  }, [uploadFile, showToast]);

  const { openConfirmDialog } = useModal();

  const handleDelete = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    openConfirmDialog({
      title: 'Delete File?',
      message: `Are you sure you want to delete "${file?.name || 'this file'}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        await removeFile(id);
        showToast('File deleted');
      },
    });
  }, [files, removeFile, showToast, openConfirmDialog]);

  const handlePreview = useCallback(async (id: string) => {
    const url = await getFileUrl(id);
    if (url) window.open(url, '_blank');
  }, [getFileUrl]);

  const handleDownload = useCallback(async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    const url = await getFileUrl(id);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [files, getFileUrl]);

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="Content Library"
        subtitle={`${files.length} files & ${allTemplates.length} email templates — upload content and manage your outreach materials`}
        action={
          <button onClick={() => openTemplateModal('create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        }
      />

      {/* View Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setViewTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewTab === 'files' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <FolderOpen className="w-4 h-4" />
            Files ({files.length})
          </button>
          <button onClick={() => setViewTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewTab === 'templates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Mail className="w-4 h-4" />
            Templates ({allTemplates.length})
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={viewTab === 'files' ? 'Search files...' : 'Search templates...'}
            value={search}
            onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Service Line Filters */}
      {viewTab === 'templates' && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => { setServiceFilter('all'); setExpandedId(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              serviceFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            All ({allTemplates.length})
          </button>
          {SERVICE_LINES.map(sl => {
            const cfg = SERVICE_LINE_CONFIG[sl];
            const count = allTemplates.filter(t => t.serviceLine === sl).length;
            return (
              <button key={sl}
                onClick={() => { setServiceFilter(sl); setExpandedId(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  serviceFilter === sl
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
                style={serviceFilter === sl ? { backgroundColor: cfg.color } : { color: cfg.color }}>
                <Icon name={cfg.icon} className="w-3.5 h-3.5" />
                {cfg.short} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* FILES TAB */}
      {viewTab === 'files' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <FileUploadZone onUpload={handleUpload} />

          {/* File Grid */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <ContentCard
                  key={file.id}
                  file={file}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  thumbnailUrl={thumbnails[file.id]}
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No files uploaded yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Upload PDFs, images, and documents to include in your campaigns. Drag and drop files above to get started.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No files match your search</h3>
              <p className="text-sm text-slate-500">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {/* TEMPLATES TAB */}
      {viewTab === 'templates' && (
        <>
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <EmailPreviewCard
                  key={template.template.id}
                  template={template}
                  expanded={expandedId === template.template.id}
                  onToggle={() => setExpandedId(expandedId === template.template.id ? null : template.template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No templates found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
