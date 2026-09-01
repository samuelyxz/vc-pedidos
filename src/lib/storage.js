// Persistência: usa window.storage (artifact Claude) ou localStorage.
// `window.storage` não é padrão — API só presente dentro de artifacts do Claude.
const claudeStorage =
  typeof window !== 'undefined'
    ? /** @type {{ get: Function, set: Function, delete: Function } | undefined} */ (
        /** @type {any} */ (window).storage
      )
    : undefined;
const hasClaudeStorage =
  !!claudeStorage && typeof claudeStorage.get === 'function';
const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;

export const store = {
  async get(key, fallback = null) {
    try {
      if (hasClaudeStorage) {
        const r = await claudeStorage.get(key);
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
        await claudeStorage.set(key, JSON.stringify(value));
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
        await claudeStorage.delete(key);
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
