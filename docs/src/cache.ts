/**
 * A robust cache implementation using IndexedDB to avoid localStorage quota limits.
 */
export class LocalCache {
  private static DB_NAME = 'dota_explorer_cache';
  private static STORE_NAME = 'entries';
  private static DB_VERSION = 1;
  private static TTL = 1000 * 60 * 60 * 24; // 24 hours

  private static db: IDBDatabase | null = null;
  private static objectUrls = new Map<string, string>();

  private static async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = (e: any) => {
        this.db = e.target.result;
        resolve(this.db!);
      };

      request.onerror = (e: any) => {
        console.error('[LocalCache] IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  static async set(key: string, data: any) {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        
        const entry = {
          data,
          timestamp: Date.now()
        };

        const request = store.put(entry, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn(`[LocalCache] Failed to store ${key}:`, e);
    }
  }

  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result;
          if (!entry) return resolve(null);

          if (Date.now() - entry.timestamp > this.TTL) {
            this.remove(key);
            return resolve(null);
          }
          resolve(entry.data);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return null;
    }
  }

  static async remove(key: string) {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).delete(key);
    } catch (e) {}
  }

  static async clear() {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).clear();
      localStorage.clear(); // Also clear localStorage just in case
    } catch (e) {
      localStorage.clear();
    }
  }

  /**
   * Fetches an image, caches its blob in IndexedDB, and returns an Object URL.
   */
  static async getCachedImageUrl(url: string): Promise<string> {
    if (this.objectUrls.has(url)) return this.objectUrls.get(url)!;

    try {
      const cachedBlob = await this.get<Blob>(`blob:${url}`);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        this.objectUrls.set(url, objectUrl);
        return objectUrl;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
      
      const blob = await response.blob();
      await this.set(`blob:${url}`, blob);
      
      const objectUrl = URL.createObjectURL(blob);
      this.objectUrls.set(url, objectUrl);
      return objectUrl;
    } catch (e) {
      console.warn(`[LocalCache] Failed to cache image ${url}:`, e);
      return url; // Fallback to raw URL
    }
  }

  static async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetchFn();
    await this.set(key, fresh);
    return fresh;
  }
}
