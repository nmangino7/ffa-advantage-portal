'use client';

import { useState, useMemo } from 'react';
import { usePortal } from '@/lib/context/PortalContext';
import { SERVICE_LINE_CONFIG, SERVICE_LINES, type ServiceLine, type ContentTemplate } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmailPreviewCard } from '@/components/ui/EmailPreviewCard';

export default function ContentLibraryPage() {
  const { campaigns } = usePortal();

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
    return templates;
  }, [campaigns]);
  const [activeTab, setActiveTab] = useState<ServiceLine | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = allTemplates;
    if (activeTab !== 'all') result = result.filter(t => t.serviceLine === activeTab);
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
  }, [allTemplates, activeTab, search]);

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="Content Library"
        subtitle={`${allTemplates.length} ready-to-send email templates across ${SERVICE_LINES.length} service lines. All content is education-only and compliance-reviewed.`}
      />

      {/* Service Line Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setActiveTab('all'); setExpandedId(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}>
          All Templates ({allTemplates.length})
        </button>
        {SERVICE_LINES.map(sl => {
          const cfg = SERVICE_LINE_CONFIG[sl];
          const count = allTemplates.filter(t => t.serviceLine === sl).length;
          return (
            <button key={sl}
              onClick={() => { setActiveTab(sl); setExpandedId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === sl
                  ? 'text-white shadow-sm'
                  : 'bg-white border border-slate-200 hover:bg-slate-50'
              }`}
              style={activeTab === sl ? { backgroundColor: cfg.color } : { color: cfg.color }}>
              <span>{cfg.icon}</span>
              {cfg.short} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates by subject, content, or campaign name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
      </div>

      {/* Template Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(template => (
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
          <p className="text-3xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No templates found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
