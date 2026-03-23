'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { useContent } from '@/lib/context/ContentContext';
import { useModal } from '@/lib/context/ModalContext';
import { useToast } from '@/lib/context/ToastContext';
import { SERVICE_LINE_CONFIG, SERVICE_LINES, type ServiceLine, type ContentTemplate } from '@/lib/types';
import { PRESENTATIONS, type PresentationDeck } from '@/lib/data/presentations';
import { PDF_COMPANIONS, type PdfCompanion } from '@/lib/data/pdf-companions';
import { EmailPreviewCard } from '@/components/ui/EmailPreviewCard';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ContentCard } from '@/components/ui/ContentCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Icon } from '@/components/ui/Icon';
import { Plus, Search, Mail, FolderOpen, LayoutGrid, Sparkles, Presentation, Download, Eye, ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';

type ViewTab = 'all' | 'files' | 'templates' | 'presentations' | 'companions';

const SERVICE_LINE_COLOR_MAP: Record<string, string> = {
  'Insurance Review': '#2563eb',
  'Under-Serviced Annuities': '#7c3aed',
  'Retirement Planning': '#059669',
  'Investment Planning': '#d97706',
  'Second-Opinion Positioning': '#dc2626',
};

export default function ContentLibraryPage() {
  const { campaigns, customTemplates, isHydrated } = usePortal();
  const { files, uploadFile, removeFile, getFileUrl, getFileThumbnail } = useContent();
  const { openTemplateModal } = useModal();
  const { showToast } = useToast();

  const [viewTab, setViewTab] = useState<ViewTab>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceLine | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
  const [downloadingDeckId, setDownloadingDeckId] = useState<string | null>(null);
  const [downloadingCompanionId, setDownloadingCompanionId] = useState<string | null>(null);

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

  const filteredPresentations = useMemo(() => {
    let result = PRESENTATIONS;
    if (serviceFilter !== 'all') {
      result = result.filter(p => p.serviceLine === serviceFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.serviceLine.toLowerCase().includes(q)
      );
    }
    return result;
  }, [serviceFilter, search]);

  const filteredCompanions = useMemo(() => {
    let result = PDF_COMPANIONS;
    if (serviceFilter !== 'all') {
      result = result.filter(p => p.serviceLine === serviceFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [serviceFilter, search]);

  const handleDownloadCompanion = useCallback(async (companion: PdfCompanion) => {
    setDownloadingCompanionId(companion.id);
    try {
      const res = await fetch('/api/ai/generate-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId: companion.id }),
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companion.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Companion PDF downloaded successfully');
    } catch {
      showToast('Failed to generate companion PDF');
    } finally {
      setDownloadingCompanionId(null);
    }
  }, [showToast]);

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

  const handleDownloadPresentation = useCallback(async (deck: PresentationDeck) => {
    setDownloadingDeckId(deck.id);
    try {
      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId: deck.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Presentation downloaded successfully');
    } catch {
      showToast('Failed to generate presentation PDF');
    } finally {
      setDownloadingDeckId(null);
    }
  }, [showToast]);

  const showFiles = viewTab === 'all' || viewTab === 'files';
  const showTemplates = viewTab === 'all' || viewTab === 'templates';
  const showPresentations = viewTab === 'all' || viewTab === 'presentations';
  const showCompanions = viewTab === 'all' || viewTab === 'companions';

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <SkeletonCard variant="stat" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Content</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {files.length} files, {allTemplates.length} templates, {PRESENTATIONS.length} presentations, and {PDF_COMPANIONS.length} companion guides
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ai-studio"
            className="border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Studio
          </Link>
          <button
            onClick={() => document.getElementById('file-upload-trigger')?.click()}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 px-4 py-2 text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => openTemplateModal('create')}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 px-4 py-2 text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-neutral-100 p-1 rounded-xl inline-flex gap-1">
          {([
            { key: 'all' as ViewTab, label: 'All', icon: LayoutGrid },
            { key: 'files' as ViewTab, label: `Files (${files.length})`, icon: FolderOpen },
            { key: 'templates' as ViewTab, label: `Templates (${allTemplates.length})`, icon: Mail },
            { key: 'presentations' as ViewTab, label: `Presentations (${PRESENTATIONS.length})`, icon: Presentation },
            { key: 'companions' as ViewTab, label: `Guides (${PDF_COMPANIONS.length})`, icon: BookOpen },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setViewTab(tab.key); setExpandedId(null); setExpandedDeckId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewTab === tab.key
                  ? 'bg-white text-neutral-900 shadow-md'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
              }`}
              style={viewTab === tab.key ? { boxShadow: '0 2px 8px rgba(99,102,241,0.12)' } : {}}
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
            onChange={e => { setSearch(e.target.value); setExpandedId(null); setExpandedDeckId(null); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Service Line Filters (shown for templates and presentations view) */}
      {(showTemplates || showPresentations) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setServiceFilter('all'); setExpandedId(null); setExpandedDeckId(null); }}
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
                onClick={() => { setServiceFilter(sl); setExpandedId(null); setExpandedDeckId(null); }}
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
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider section-divider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              Files
            </h2>
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

      {/* Presentations Section */}
      {showPresentations && (
        <div className="mb-8">
          {viewTab === 'all' && (
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider section-divider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Presentations
            </h2>
          )}

          {filteredPresentations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPresentations.map(deck => {
                const accentColor = SERVICE_LINE_COLOR_MAP[deck.serviceLine] || '#6366f1';
                const isExpanded = expandedDeckId === deck.id;
                const isDownloading = downloadingDeckId === deck.id;

                return (
                  <div
                    key={deck.id}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
                  >
                    <div className="p-5">
                      {/* Service line badge + slide count */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                        >
                          {deck.serviceLine}
                        </span>
                        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {deck.slideCount} slides
                        </span>
                      </div>

                      {/* Title + subtitle */}
                      <h3 className="text-sm font-semibold text-neutral-900 leading-snug mb-1">
                        {deck.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                        {deck.subtitle}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedDeckId(isExpanded ? null : deck.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleDownloadPresentation(deck)}
                          disabled={isDownloading}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-60"
                          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                        >
                          {isDownloading ? (
                            <>
                              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Download PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded slide list */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                          Slide Outline
                        </p>
                        <ol className="space-y-1.5">
                          {deck.slides.map((slide, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0 mt-0.5"
                                style={{ backgroundColor: accentColor, fontSize: '9px' }}
                              >
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <span className="font-medium text-neutral-800">{slide.title}</span>
                                {slide.type !== 'content' && (
                                  <span className="ml-1.5 text-neutral-400 capitalize">
                                    ({slide.type.replace('-', ' ')})
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Presentation className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">No presentations match your search</h3>
              <p className="text-sm text-neutral-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Companion Guides Section */}
      {showCompanions && (
        <div className="mb-8">
          {viewTab === 'all' && (
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider section-divider">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Companion Guides
            </h2>
          )}

          {filteredCompanions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCompanions.map(comp => {
                const accentColor = SERVICE_LINE_COLOR_MAP[comp.serviceLine] || '#6366f1';
                const isDownloading = downloadingCompanionId === comp.id;
                const campaign = campaigns.find(c => c.id === comp.campaignId);

                return (
                  <div
                    key={comp.id}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                        >
                          {comp.serviceLine}
                        </span>
                        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {comp.pageCount} pages
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-neutral-900 leading-snug mb-1">
                        {comp.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mb-2 leading-relaxed">
                        {comp.description}
                      </p>
                      {campaign && (
                        <p className="text-[10px] text-neutral-400 mb-4">
                          Companion to: <Link href={`/campaigns/${campaign.id}`} className="text-indigo-500 hover:text-indigo-700 font-medium">{campaign.name}</Link>
                        </p>
                      )}

                      <button
                        onClick={() => handleDownloadCompanion(comp)}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                      >
                        {isDownloading ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Download PDF Guide
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-900 mb-1">No companion guides match your search</h3>
              <p className="text-sm text-neutral-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Templates Section */}
      {showTemplates && (
        <div>
          {viewTab === 'all' && (
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider section-divider">
              <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
              Email Templates
            </h2>
          )}

          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <EmailPreviewCard
                  /* card-hover-premium applied via EmailPreviewCard wrapper */
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
