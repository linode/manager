import { StackScriptPayload } from '@linode/api-v4/lib/stackscripts/types';

import { shouldEnableDevTools } from 'src/dev-tools/load';

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
  if ((item === null || item === undefined) && !!fallback) {
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
const INFINITE_PAGE_SIZE = 'INFINITE_PAGE_SIZE';
const BACKUPSCTA_DISMISSED = 'BackupsCtaDismissed';
const TYPE_TO_CONFIRM = 'typeToConfirm';
const TOKEN = 'authentication/token';
const NONCE = 'authentication/nonce';
const SCOPES = 'authentication/scopes';
const EXPIRE = 'authentication/expire';
const SUPPORT = 'support';
const TICKET = 'ticket';
const STACKSCRIPT = 'stackscript';
const DEV_TOOLS_ENV = 'devTools/env';

export type PageSize = number;

interface AuthGetAndSet {
  get: () => any;
  set: (value: string) => void;
}

interface SupportText {
  description: string;
  title: string;
}

interface TicketReply {
  text: string;
  ticketId: number;
}

interface StackScriptData extends StackScriptPayload {
  id: number | string;
  updated: string;
}

export interface DevToolsEnv {
  apiRoot: string;
  clientID: string;
  label: string;
  loginRoot: string;
}

export interface Storage {
  BackupsCtaDismissed: {
    get: () => boolean;
    set: (v: 'false' | 'true') => void;
  };
  authentication: {
    expire: AuthGetAndSet;
    nonce: AuthGetAndSet;
    scopes: AuthGetAndSet;
    token: AuthGetAndSet;
  };
  devToolsEnv: {
    get: () => DevToolsEnv | null;
    set: (devToolsEnv: DevToolsEnv) => void;
  };
  infinitePageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  pageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  stackScriptInProgress: {
    get: () => StackScriptData;
    set: (s: StackScriptData) => void;
  };
  supportText: {
    get: () => SupportText;
    set: (v: SupportText) => void;
  };
  ticketReply: {
    get: () => TicketReply;
    set: (v: TicketReply) => void;
  };
  typeToConfirm: {
    get: () => boolean;
    set: (v: 'false' | 'true') => void;
  };
}

export const storage: Storage = {
  BackupsCtaDismissed: {
    get: () => getStorage(BACKUPSCTA_DISMISSED),
    set: () => setStorage(BACKUPSCTA_DISMISSED, 'true'),
  },
  authentication: {
    expire: {
      get: () => getStorage(EXPIRE),
      set: (v) => setStorage(EXPIRE, v),
    },
    nonce: {
      get: () => getStorage(NONCE),
      set: (v) => setStorage(NONCE, v),
    },
    scopes: {
      get: () => getStorage(SCOPES),
      set: (v) => setStorage(SCOPES, v),
    },
    token: {
      get: () => getStorage(TOKEN),
      set: (v) => setStorage(TOKEN, v),
    },
  },
  devToolsEnv: {
    get: () => {
      const value = getStorage(DEV_TOOLS_ENV);
      return isDevToolsEnvValid(value) ? value : undefined;
    },
    set: (devToolsEnv) =>
      setStorage(DEV_TOOLS_ENV, JSON.stringify(devToolsEnv)),
  },
  // Page Size of Linodes Landing page.
  infinitePageSize: {
    get: () => {
      // For backwards compatibility, we'll fall back to the value of PAGE_SIZE.
      // If that doesn't exist, we use '25' as a second fallback.
      const fallback = parseInt(getStorage(PAGE_SIZE, '25'), 10);

      // I used Number() instead of parseInt() here because parseInt() does not
      // parse the string "Infinity" as a Number.
      return Number(getStorage(INFINITE_PAGE_SIZE, fallback));
    },
    set: (v) => setStorage(INFINITE_PAGE_SIZE, `${v}`),
  },
  pageSize: {
    get: () => {
      return parseInt(getStorage(PAGE_SIZE, '25'), 10);
    },
    set: (v) => setStorage(PAGE_SIZE, `${v}`),
  },
  stackScriptInProgress: {
    get: () =>
      getStorage(STACKSCRIPT, {
        id: -1,
        images: [],
        label: '',
        script: '',
      }),
    set: (s) => setStorage(STACKSCRIPT, JSON.stringify(s)),
  },
  supportText: {
    get: () => getStorage(SUPPORT, { description: '', title: '' }),
    set: (v) => setStorage(SUPPORT, JSON.stringify(v)),
  },
  ticketReply: {
    get: () => getStorage(TICKET, { text: '' }),
    set: (v) => setStorage(TICKET, JSON.stringify(v)),
  },
  typeToConfirm: {
    get: () => getStorage(TYPE_TO_CONFIRM),
    set: (v) => setStorage(TYPE_TO_CONFIRM, 'true'),
  },
};

export const {
  BackupsCtaDismissed,
  authentication,
  stackScriptInProgress,
  supportText,
  ticketReply,
} = storage;

// Only return these if the dev tools are enabled and we're in development mode.
export const getEnvLocalStorageOverrides = () => {
  // This is broken into two logical branches so that local storage is accessed
  // ONLY if the dev tools are enabled and it's a development build.
  if (shouldEnableDevTools && import.meta.env.DEV) {
    const localStorageOverrides = storage.devToolsEnv.get();
    if (localStorageOverrides) {
      return localStorageOverrides;
    }
  }
  return undefined;
};

export const isDevToolsEnvValid = (value: any) => {
  return (
    typeof value?.apiRoot === 'string' &&
    typeof value?.loginRoot === 'string' &&
    typeof value?.clientID === 'string' &&
    typeof value?.label === 'string'
  );
};
