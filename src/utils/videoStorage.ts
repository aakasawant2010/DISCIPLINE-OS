/**
 * IndexedDB storage for Daily Progress Videos.
 * Keeps video blobs persistent in the browser without exceeding localStorage quotas.
 */

const DB_NAME = 'RESET_VIDEO_VAULT';
const DB_VERSION = 1;
const STORE_NAME = 'progress_videos';

export interface StoredVideoRecord {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  durationSeconds: number;
  blob: Blob;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveVideoToVault(record: StoredVideoRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllVideosFromVault(): Promise<StoredVideoRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as StoredVideoRecord[];
        // Sort descending by date / createdAt
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load videos from IndexedDB:', err);
    return [];
  }
}

export async function getVideoByDateFromVault(date: string): Promise<StoredVideoRecord | null> {
  try {
    const all = await getAllVideosFromVault();
    return all.find((v) => v.date === date) || null;
  } catch {
    return null;
  }
}

export async function deleteVideoFromVault(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
