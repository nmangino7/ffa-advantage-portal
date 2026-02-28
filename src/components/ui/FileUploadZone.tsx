'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Image, X, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function FileUploadZone({ onUpload, accept = '.pdf,.png,.jpg,.jpeg,.webp,.docx', maxSize = 10, multiple = true }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    setError(null);
    setSuccess(null);

    // Validate
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`"${file.name}" exceeds ${maxSize}MB limit`);
        return;
      }
    }

    setUploading(true);
    try {
      await onUpload(files);
      setSuccess(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onUpload, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : uploading
              ? 'border-slate-300 bg-slate-50 cursor-wait'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-blue-100' : 'bg-slate-100'
          }`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
          </div>

          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-blue-600 font-medium">Uploading...</span>
            </div>
          ) : isDragging ? (
            <p className="text-sm font-semibold text-blue-600">Drop files here</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Drag and drop files, or <span className="text-blue-600">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, DOCX up to {maxSize}MB</p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <FileText className="w-3.5 h-3.5" /> PDF
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Image className="w-3.5 h-3.5" /> Images
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <FileText className="w-3.5 h-3.5" /> DOCX
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-700">{success}</p>
        </div>
      )}
    </div>
  );
}
