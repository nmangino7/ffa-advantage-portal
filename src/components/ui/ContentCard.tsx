'use client';

import { useState, useEffect } from 'react';
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
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden group">
      {/* Thumbnail / Icon */}
      <div className="h-32 bg-slate-50 flex items-center justify-center relative overflow-hidden">
        {isImage && thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            isPdf ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Icon className={`w-7 h-7 ${isPdf ? 'text-red-500' : 'text-blue-500'}`} />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onPreview(file.id)}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
            title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => onDownload(file.id)}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
            title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(file.id)}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
            title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-900 truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
          <span className="text-[10px] text-slate-300">&middot;</span>
          <span className="text-[10px] text-slate-400">{formatDate(file.uploadedAt)}</span>
        </div>
        {file.serviceLine && (
          <span className="inline-block text-[9px] px-2 py-0.5 mt-2 bg-blue-50 text-blue-600 rounded-md font-semibold">
            {file.serviceLine}
          </span>
        )}
      </div>
    </div>
  );
}
