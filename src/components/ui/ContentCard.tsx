'use client';

import { FileText, Image as ImageIcon, Download, Trash2, Eye } from 'lucide-react';
import type { ContentFile } from '@/lib/types';

const FILE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/png': ImageIcon,
  'image/jpeg': ImageIcon,
  'image/jpg': ImageIcon,
  'image/webp': ImageIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ContentCardProps {
  file: ContentFile;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  thumbnailUrl?: string | null;
}

export function ContentCard({ file, onDelete, onPreview, onDownload, thumbnailUrl }: ContentCardProps) {
  const Icon = FILE_ICONS[file.mimeType] || FileText;
  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-200 overflow-hidden group card-hover">
      {/* Thumbnail */}
      <div className="h-32 bg-neutral-50 flex items-center justify-center relative overflow-hidden">
        {isImage && thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isPdf ? 'bg-red-50' : 'bg-neutral-100'}`}>
            <Icon className={`w-6 h-6 ${isPdf ? 'text-red-400' : 'text-neutral-400'}`} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onPreview(file.id)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-neutral-700 hover:bg-white" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onDownload(file.id)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-neutral-700 hover:bg-white" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(file.id)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-neutral-400">{formatSize(file.size)}</span>
          <span className="text-[10px] text-neutral-300">&middot;</span>
          <span className="text-[10px] text-neutral-400">{formatDate(file.uploadedAt)}</span>
        </div>
        {file.serviceLine && (
          <span className="inline-block text-[9px] px-1.5 py-0.5 mt-2 rounded font-medium"
            style={{
              backgroundColor: file.serviceLine === 'Retirement Planning' ? '#eef2ff'
                : file.serviceLine === 'Insurance Review' ? '#ecfdf5'
                : file.serviceLine === 'Under-Serviced Annuities' ? '#fefce8'
                : file.serviceLine === 'Investment Planning' ? '#faf5ff'
                : file.serviceLine === 'Second-Opinion Positioning' ? '#fff7ed'
                : '#eef2ff',
              color: file.serviceLine === 'Retirement Planning' ? '#4f46e5'
                : file.serviceLine === 'Insurance Review' ? '#059669'
                : file.serviceLine === 'Under-Serviced Annuities' ? '#ca8a04'
                : file.serviceLine === 'Investment Planning' ? '#7c3aed'
                : file.serviceLine === 'Second-Opinion Positioning' ? '#c2410c'
                : '#4f46e5',
            }}>
            {file.serviceLine}
          </span>
        )}
      </div>
    </div>
  );
}
