import { openDB, DBSchema } from 'idb';

interface HerCareDB extends DBSchema {
  cycles: {
    key: string;
    value: {
      id: string;
      date: string;
      flow: 'light' | 'medium' | 'heavy' | 'spotting';
      symptoms: string[];
      mood?: string;
    };
    indexes: { 'by-date': string };
  };
}

const dbPromise = typeof window !== 'undefined' 
  ? openDB<HerCareDB>('hercare-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('cycles', { keyPath: 'id' });
        store.createIndex('by-date', 'date');
      },
    })
  : Promise.resolve(null);

export const storage = {
  async addCycleEntry(entry: Omit<HerCareDB['cycles']['value'], 'id'>) {
    const db = await dbPromise;
    if (!db) return;
    const id = Date.now().toString();
    return db.put('cycles', { ...entry, id });
  },

  async getCycleEntries() {
    const db = await dbPromise;
    if (!db) return [];
    return db.getAllFromIndex('cycles', 'by-date');
  },
};
