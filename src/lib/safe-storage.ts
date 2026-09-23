import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * Browser storage for the persisted stores (unlocks, Snake, Paint), failing
 * safe. Imported by plain-node tests too, so no `@/` alias and type-only
 * imports from zustand.
 */

/** The minimal `Storage` surface, so tests can hand in a stand-in. */
export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * JSON storage that fails safe. Unreadable JSON reads as "nothing stored";
 * a storage that throws (blocked, private mode, quota) is treated as absent.
 * The page keeps working either way - progress is then simply not remembered.
 */
export function safeJSONStorage<S>(getStorage: () => StorageLike | undefined): PersistStorage<S> {
  const storage = (): StorageLike | undefined => {
    try {
      return getStorage();
    } catch {
      return undefined;
    }
  };
  return {
    getItem: (name) => {
      try {
        const raw = storage()?.getItem(name);
        if (raw === null || raw === undefined) return null;
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as StorageValue<S>;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        storage()?.setItem(name, JSON.stringify(value));
      } catch {
        // Quota or blocked storage: keep the state in memory only.
      }
    },
    removeItem: (name) => {
      try {
        storage()?.removeItem(name);
      } catch {
        // Nothing to remove.
      }
    },
  };
}
