// localStorage/sessionStorage can be unavailable (private mode, blocked
// cookies), so every access is guarded and failures are silent.

function safe(store) {
  return {
    get(key) {
      try {
        return store().getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        store().setItem(key, value);
      } catch {
        /* storage unavailable */
      }
    },
    remove(key) {
      try {
        store().removeItem(key);
      } catch {
        /* storage unavailable */
      }
    },
    getJSON(key) {
      try {
        return JSON.parse(store().getItem(key));
      } catch {
        return null;
      }
    },
    setJSON(key, value) {
      try {
        store().setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable */
      }
    },
  };
}

export const storage = safe(() => window.localStorage);
export const session = safe(() => window.sessionStorage);
