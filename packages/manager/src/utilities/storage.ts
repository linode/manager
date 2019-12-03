const localStorageCache = {};

export const getStorage = (key: string, fallback?: any) => {
  if (localStorageCache[key]) {
    return localStorageCache[key];
  }

  const item = window.localStorage.getItem(key);
  /*
   * Basically, if localstorage doesn't exist,
   * return whatever we set as a fallback
   */
  if (item === null && !!fallback) {
    return fallback;
  }

  try {
    // Try to parse as JSON first. This will turn "true" (string) into `true` (boolean).
    const parsedItem = JSON.parse(item as any);
    localStorageCache[key] = parsedItem;
    return parsedItem;
  } catch (e) {
    // It's okay if we can't parse as JSON -- just use the raw value instead.
    localStorageCache[key] = item;
    return item;
  }
};

export const setStorage = (key: string, value: string) => {
  try {
    // Store parsed JSON if possible.
    localStorageCache[key] = JSON.parse(value);
  } catch {
    // Otherwise just use the raw value.
    localStorageCache[key] = value;
  }
  return window.localStorage.setItem(key, value);
};

const PAGE_SIZE = 'PAGE_SIZE';
const LINODE_PAGE_SIZE = 'LINODE_PAGE_SIZE';
const HIDE_DISPLAY_GROUPS_CTA = 'importDisplayGroupsCTA';
const HAS_IMPORTED_GROUPS = 'hasImportedGroups';
const BACKUPSCTA_DISMISSED = 'BackupsCtaDismissed';
const TOKEN = 'authentication/token';
const NONCE = 'authentication/nonce';
const SCOPES = 'authentication/scopes';
const EXPIRE = 'authentication/expire';

export type PageSize = number;

interface AuthGetAndSet {
  get: () => any;
  set: (value: string) => void;
}

export interface Storage {
  authentication: {
    token: AuthGetAndSet;
    nonce: AuthGetAndSet;
    scopes: AuthGetAndSet;
    expire: AuthGetAndSet;
  };
  pageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  linodePageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  hideGroupImportCTA: {
    get: () => 'true' | 'false';
    set: () => void;
  };
  hasImportedGroups: {
    get: () => 'true' | 'false';
    set: () => void;
  };
  BackupsCtaDismissed: {
    get: () => boolean;
    set: (v: 'true' | 'false') => void;
  };
}

export const storage: Storage = {
  authentication: {
    token: {
      get: () => getStorage(TOKEN),
      set: v => setStorage(TOKEN, v)
    },
    nonce: {
      get: () => getStorage(NONCE),
      set: v => setStorage(NONCE, v)
    },
    scopes: {
      get: () => getStorage(SCOPES),
      set: v => setStorage(SCOPES, v)
    },
    expire: {
      get: () => getStorage(EXPIRE),
      set: v => setStorage(EXPIRE, v)
    }
  },
  pageSize: {
    get: () => {
      return parseInt(getStorage(PAGE_SIZE, '25'), 10);
    },
    set: v => setStorage(PAGE_SIZE, `${v}`)
  },
  // Page Size of Linodes Landing page.
  linodePageSize: {
    get: () => {
      // For backwards compatibility, we'll fall back to the value of PAGE_SIZE.
      // If that doesn't exist, we use '25' as a second fallback.
      const fallback = parseInt(getStorage(PAGE_SIZE, '25'), 10);

      // I used Number() instead of parseInt() here because parseInt() does not
      // parse the string "Infinity" as a Number.
      return Number(getStorage(LINODE_PAGE_SIZE, fallback));
    },
    set: v => setStorage(LINODE_PAGE_SIZE, `${v}`)
  },
  hideGroupImportCTA: {
    get: () => getStorage(HIDE_DISPLAY_GROUPS_CTA),
    set: () => setStorage(HIDE_DISPLAY_GROUPS_CTA, 'true')
  },
  hasImportedGroups: {
    get: () => getStorage(HAS_IMPORTED_GROUPS),
    set: () => setStorage(HAS_IMPORTED_GROUPS, 'true')
  },
  BackupsCtaDismissed: {
    get: () => getStorage(BACKUPSCTA_DISMISSED),
    set: () => setStorage(BACKUPSCTA_DISMISSED, 'true')
  }
};

export const { authentication, BackupsCtaDismissed } = storage;
