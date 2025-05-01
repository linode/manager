import { shouldLoadDevTools } from 'src/dev-tools/load';

import type { RegionSite } from '@linode/api-v4';
import type { StackScriptPayload } from '@linode/api-v4/lib/stackscripts/types';
import type { SupportTicketFormFields } from 'src/features/Support/SupportTickets/SupportTicketDialog';

const localStorageCache: Record<string, any> = {};

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
const CODE_VERIFIER = 'authentication/code-verifier';
const SCOPES = 'authentication/scopes';
const EXPIRE = 'authentication/expire';
const SUPPORT = 'support';
const TICKET = 'ticket';
const STACKSCRIPT = 'stackscript';
const DEV_TOOLS_ENV = 'devTools/env';
const REGION_FILTER = 'regionFilter';
const NODE_POOLS_EXPANDED = 'nodePoolsExpanded';

export type PageSize = number;
export type RegionFilter = 'all' | RegionSite;

interface AuthGetAndSet {
  get: () => any;
  set: (value: string) => void;
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

// We declare and export here to ensure it is available in the test environment, avoiding test failures.
export const supportTicketStorageDefaults: SupportTicketFormFields = {
  description: '',
  entityId: '',
  entityInputValue: '',
  entityType: 'general',
  selectedSeverity: undefined,
  summary: '',
  ticketType: 'general',
};

export interface Storage {
  authentication: {
    codeVerifier: AuthGetAndSet;
    expire: AuthGetAndSet;
    nonce: AuthGetAndSet;
    scopes: AuthGetAndSet;
    token: AuthGetAndSet;
  };
  BackupsCtaDismissed: {
    get: () => boolean;
    set: (v: 'false' | 'true') => void;
  };
  devToolsEnv: {
    get: () => DevToolsEnv | null;
    set: (devToolsEnv: DevToolsEnv) => void;
  };
  infinitePageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  nodePoolsExpanded: {
    get: (clusterId: number) => number[];
    set: (clusterId: number, v: number[]) => void;
  };
  pageSize: {
    get: () => PageSize;
    set: (perPage: PageSize) => void;
  };
  regionFilter: {
    get: () => RegionFilter;
    set: (v: RegionFilter) => void;
  };
  stackScriptInProgress: {
    get: () => StackScriptData;
    set: (s: StackScriptData) => void;
  };
  supportTicket: {
    get: () => SupportTicketFormFields;
    set: (v: SupportTicketFormFields) => void;
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
    codeVerifier: {
      get: () => getStorage(CODE_VERIFIER),
      set: (v) => setStorage(CODE_VERIFIER, v),
    },
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
  nodePoolsExpanded: {
    get: (clusterId) => getStorage(`${NODE_POOLS_EXPANDED}-${clusterId}`),
    set: (clusterId, v) =>
      setStorage(`${NODE_POOLS_EXPANDED}-${clusterId}`, JSON.stringify(v)),
  },
  pageSize: {
    get: () => {
      return parseInt(getStorage(PAGE_SIZE, '25'), 10);
    },
    set: (v) => setStorage(PAGE_SIZE, `${v}`),
  },
  regionFilter: {
    get: () => getStorage(REGION_FILTER),
    set: (v) => setStorage(REGION_FILTER, v),
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
  supportTicket: {
    get: () => getStorage(SUPPORT, supportTicketStorageDefaults),
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
  supportTicket,
  ticketReply,
} = storage;

// Only return these if the dev tools are enabled and we're in development mode.
export const getEnvLocalStorageOverrides = () => {
  // This is broken into two logical branches so that local storage is accessed
  // ONLY if the dev tools are enabled and it's a development build.
  if (shouldLoadDevTools && import.meta.env.DEV) {
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
