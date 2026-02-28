// ─── Persistence Layer ────────────────────────────────────────
// localStorage for JSON state, IndexedDB for binary files (PDFs, images)

const DB_NAME = 'ffa-advantage';
const DB_VERSION = 1;
const FILE_STORE = 'files';

// ─── localStorage (JSON state) ───────────────────────────────

export function saveState<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[storage] Failed to save ${key}:`, e);
  }
}

export function loadState<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeState(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ─── IndexedDB (binary files) ────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: ArrayBuffer;
  uploadedAt: string;
}

export async function saveFile(file: StoredFile): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(file);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadFile(id: string): Promise<StoredFile | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readonly');
    const req = tx.objectStore(FILE_STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listFiles(): Promise<StoredFile[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readonly');
    const req = tx.objectStore(FILE_STORE).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearFiles(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Debounced auto-save ─────────────────────────────────────

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function debouncedSave<T>(key: string, data: T, delay = 300): void {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(key, setTimeout(() => {
    saveState(key, data);
    timers.delete(key);
  }, delay));
}

// ─── Full reset ──────────────────────────────────────────────

const STORAGE_KEYS = [
  'ffa-contacts',
  'ffa-campaigns',
  'ffa-activities',
  'ffa-custom-templates',
  'ffa-content-files',
  'ffa-storage-version',
  'ffa-settings-tab',
  'ffa-wizard-step',
  'ffa-wizard-provider',
  'ffa-how-it-works-dismissed',
];

export function clearAllData(): void {
  for (const key of STORAGE_KEYS) {
    removeState(key);
  }
  // Also clear any other ffa- keys
  const allKeys = Object.keys(localStorage);
  for (const key of allKeys) {
    if (key.startsWith('ffa-')) removeState(key);
  }
  clearFiles().catch(() => {});
}
