// Persistência: usa window.storage (artifact Claude) ou localStorage.
const hasClaudeStorage =
  typeof window !== 'undefined' &&
  window.storage &&
  typeof window.storage.get === 'function';
const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

export const store = {
  async get(key, fallback = null) {
    try {
      if (hasClaudeStorage) {
        const r = await window.storage.get(key);
        return r && r.value != null ? JSON.parse(r.value) : fallback;
      }
      if (hasLocalStorage) {
        const v = localStorage.getItem(key);
        return v != null ? JSON.parse(v) : fallback;
      }
      return fallback;
    } catch {
      return fallback;
    }
  },
  async set(key, value) {
    try {
      if (hasClaudeStorage) {
        await window.storage.set(key, JSON.stringify(value));
        return true;
      }
      if (hasLocalStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  async delete(key) {
    try {
      if (hasClaudeStorage) {
        await window.storage.delete(key);
        return true;
      }
      if (hasLocalStorage) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
