/**
 * Storage adapter for Weavr Connect
 * 
 * In Claude artifacts, storage uses window.storage (async key-value API).
 * In standalone mode, we polyfill it with localStorage.
 * 
 * This adapter provides the same async interface so the app code
 * doesn't need to change.
 */

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        var value = localStorage.getItem(key);
        if (value === null) throw new Error('Key not found');
        return { key: key, value: value };
      } catch (e) {
        throw e;
      }
    },

    async set(key, value) {
      try {
        localStorage.setItem(key, value);
        return { key: key, value: value };
      } catch (e) {
        return null;
      }
    },

    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key: key, deleted: true };
      } catch (e) {
        return null;
      }
    },

    async list(prefix) {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!prefix || k.startsWith(prefix)) {
          keys.push(k);
        }
      }
      return { keys: keys, prefix: prefix };
    }
  };
}
