'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useContent } from '@/lib/context/ContentContext';
import { useModal } from '@/lib/context/ModalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG, SERVICE_LINES, type ServiceLine, type ContentTemplate } from '@/lib/types';
import { EmailPreviewCard } from '@/components/ui/EmailPreviewCard';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ContentCard } from '@/components/ui/ContentCard';
import { Icon } from '@/components/ui/Icon';
import { Plus, Search, Mail, FolderOpen, LayoutGrid } from 'lucide-react';

type ViewTab = 'all' | 'files' | 'templates';

export default function ContentLibraryPage() {
  const { campaigns, customTemplates } = usePortal();
  const { files, uploadFile, removeFile, getFileUrl, getFileThumbnail } = useContent();
  const { openTemplateModal } = useModal();
  const { showToast } = useToast();

  const [viewTab, setViewTab] = useState<ViewTab>('all');
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

  const showFiles = viewTab === 'all' || viewTab === 'files';
  const showTemplates = viewTab === 'all' || viewTab === 'templates';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Content</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {files.length} files and {allTemplates.length} email templates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById('file-upload-trigger')?.click()}
            className="border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 px-4 py-2 text-sm font-semibold transition-colors"
          >
            Upload File
          </button>
          <button
            onClick={() => openTemplateModal('create')}
            className="bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex border border-neutral-200 rounded-lg p-0.5">
          {([
            { key: 'all' as ViewTab, label: 'All', icon: LayoutGrid },
            { key: 'files' as ViewTab, label: `Files (${files.length})`, icon: FolderOpen },
            { key: 'templates' as ViewTab, label: `Templates (${allTemplates.length})`, icon: Mail },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setViewTab(tab.key); setExpandedId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                viewTab === tab.key
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
          />
        </div>
      </div>

      {/* Service Line Filters (shown for templates view) */}
      {showTemplates && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setServiceFilter('all'); setExpandedId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              serviceFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All ({allTemplates.length})
          </button>
          {SERVICE_LINES.map(sl => {
            const cfg = SERVICE_LINE_CONFIG[sl];
            const count = allTemplates.filter(t => t.serviceLine === sl).length;
            return (
              <button
                key={sl}
                onClick={() => { setServiceFilter(sl); setExpandedId(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  serviceFilter === sl
                    ? 'text-white'
                    : 'border border-neutral-200 hover:bg-neutral-50'
                }`}
                style={serviceFilter === sl
                  ? { backgroundColor: cfg.color }
                  : { color: cfg.color }
                }
              >
                <Icon name={cfg.icon} className="w-3 h-3" />
                {cfg.short} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Files Section */}
      {showFiles && (
        <div className="mb-8">
          {viewTab === 'all' && (
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Files</h2>
          )}

          <FileUploadZone onUpload={handleUpload} />

          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
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
            <div className="text-center py-12 bg-white rounded-xl border border-neutral-200 mt-4">
              <FolderOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">No files uploaded yet</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Upload PDFs, images, and documents to include in your campaigns. Drag and drop files above to get started.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 mt-4">
              <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">No files match your search</h3>
              <p className="text-sm text-neutral-500">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {/* Templates Section */}
      {showTemplates && (
        <div>
          {viewTab === 'all' && (
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Email Templates</h2>
          )}

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
              <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">No templates found</h3>
              <p className="text-sm text-neutral-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
