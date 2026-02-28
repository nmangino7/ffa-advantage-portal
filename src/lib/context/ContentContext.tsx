'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { saveFile, loadFile, deleteFile as deleteStoredFile, listFiles } from '@/lib/storage';
import { loadState, debouncedSave } from '@/lib/storage';
import type { ContentFile, ServiceLine } from '@/lib/types';

const METADATA_KEY = 'ffa-content-files';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

interface ContentContextType {
  files: ContentFile[];
  isLoading: boolean;
  uploadFile: (file: File, serviceLine?: ServiceLine) => Promise<ContentFile | null>;
  removeFile: (id: string) => Promise<void>;
  getFileUrl: (id: string) => Promise<string | null>;
  getFileThumbnail: (id: string) => Promise<string | null>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const didHydrate = useRef(false);

  // Hydrate metadata from localStorage
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    const saved = loadState<ContentFile[]>(METADATA_KEY);
    if (saved) setFiles(saved);
    setIsLoading(false);
  }, []);

  // Auto-save metadata
  useEffect(() => {
    if (isLoading) return;
    debouncedSave(METADATA_KEY, files);
  }, [files, isLoading]);

  const uploadFile = useCallback(async (file: File, serviceLine?: ServiceLine): Promise<ContentFile | null> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload PDF, PNG, JPG, or DOCX files.');
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const arrayBuffer = await file.arrayBuffer();

    // Store binary in IndexedDB
    await saveFile({
      id,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      data: arrayBuffer,
      uploadedAt: new Date().toISOString(),
    });

    // Store metadata
    const metadata: ContentFile = {
      id,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      serviceLine,
      tags: [],
    };

    setFiles(prev => [metadata, ...prev]);
    return metadata;
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await deleteStoredFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const getFileUrl = useCallback(async (id: string): Promise<string | null> => {
    const stored = await loadFile(id);
    if (!stored) return null;
    const blob = new Blob([stored.data], { type: stored.mimeType });
    return URL.createObjectURL(blob);
  }, []);

  const getFileThumbnail = useCallback(async (id: string): Promise<string | null> => {
    const stored = await loadFile(id);
    if (!stored) return null;
    if (stored.mimeType.startsWith('image/')) {
      const blob = new Blob([stored.data], { type: stored.mimeType });
      return URL.createObjectURL(blob);
    }
    return null;
  }, []);

  return (
    <ContentContext.Provider value={{ files, isLoading, uploadFile, removeFile, getFileUrl, getFileThumbnail }}>
      {children}
    </ContentContext.Provider>
  );
}
