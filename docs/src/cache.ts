declare const __BUILD_VERSION__: string;

/**
 * A robust cache implementation using IndexedDB to avoid localStorage quota limits.
 * Automatically invalidated whenever a new build is deployed.
 */
export class LocalCache {
  private static DB_NAME = 'dota_explorer_cache';
  private static STORE_NAME = 'entries';
  private static DB_VERSION = 1;
  private static db: IDBDatabase | null = null;
  private static versionChecked = false;

  private static async checkVersion(): Promise<void> {
    if (this.versionChecked) return;
    this.versionChecked = true;

    try {
      const currentVersion = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : 'dev';
      const storedVersion = localStorage.getItem('dota_build_version');
      if (storedVersion && storedVersion !== currentVersion) {
        console.log(`[LocalCache] Deployment update detected (${storedVersion} -> ${currentVersion}). Clearing cache.`);
        await this.clear();
      }
      localStorage.setItem('dota_build_version', currentVersion);
    } catch (e) {
      console.warn('[LocalCache] Version check error:', e);
    }
  }

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
    await this.checkVersion();
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
    await this.checkVersion();
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result;
          if (!entry) return resolve(null);
          resolve(entry.data);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (e) {}
  }

  static async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (e) {
      console.warn('[LocalCache] Clear failed:', e);
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
