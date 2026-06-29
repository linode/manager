import {
  clearStorage,
  CODE_VERIFIER,
  EXPIRE,
  getStorage,
  INFINITE_PAGE_SIZE,
  NONCE,
  PAGE_SIZE,
  REGION_FILTER,
  SCOPES,
  setStorage,
  TOKEN,
} from '@akamai/compute-ui-core/browser';

import { ENABLE_DEV_TOOLS } from 'src/constants';

import type {
  AuthGetAndSet,
  RegionFilter,
} from '@akamai/compute-ui-core/browser';
import type { StackScriptPayload } from '@linode/api-v4/lib/stackscripts/types';
import type { SupportTicketFormFields } from 'src/features/Support/SupportTickets/SupportTicketDialog';

const sessionStorageCache: Record<string, any> = {};

export const getSessionStorage = (key: string): string | undefined => {
  if (key in sessionStorageCache) {
    return sessionStorageCache[key];
  }
  const item = window.sessionStorage.getItem(key);
  sessionStorageCache[key] = item ?? undefined;
  return item ?? undefined;
};

export const setSessionStorage = (key: string, value: string) => {
  sessionStorageCache[key] = value;
  window.sessionStorage.setItem(key, value);
};

export const clearSessionStorage = (key: string) => {
  delete sessionStorageCache[key];
  window.sessionStorage.removeItem(key);
};

const SUPPORT = 'support';
const TICKET = 'ticket';
const STACKSCRIPT = 'stackscript';
const DEV_TOOLS_ENV = 'devTools/env';
const NODE_POOLS_EXPANDED = 'nodePoolsExpanded';
const AI_MODELS_LIST_VIEW_TYPE = 'AI_MODELS_LIST_VIEW_TYPE';

export type PageSize = number;

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
  entityType: 'none',
  selectedSeverity: undefined,
  summary: '',
  ticketType: 'general',
  title: '',
  entity: {
    id: undefined,
    type: 'none',
  },
  formPayloadValues: {},
};

export interface Storage {
  aiModelsListViewType: {
    get: () => 'grid' | 'list';
    set: (v: 'grid' | 'list') => void;
  };
  authentication: {
    codeVerifier: AuthGetAndSet;
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
}

export const storage: Storage = {
  aiModelsListViewType: {
    get: () => getStorage(AI_MODELS_LIST_VIEW_TYPE, 'grid') as 'grid' | 'list',
    set: (v) => setStorage(AI_MODELS_LIST_VIEW_TYPE, v),
  },
  authentication: {
    codeVerifier: {
      get: () => getSessionStorage(CODE_VERIFIER),
      set: (v) => setSessionStorage(CODE_VERIFIER, v),
      clear: () => clearSessionStorage(CODE_VERIFIER),
    },
    expire: {
      get: () => getStorage(EXPIRE),
      set: (v) => setStorage(EXPIRE, v),
      clear: () => clearStorage(EXPIRE),
    },
    nonce: {
      get: () => getSessionStorage(NONCE),
      set: (v) => setSessionStorage(NONCE, v),
      clear: () => clearSessionStorage(NONCE),
    },
    scopes: {
      get: () => getStorage(SCOPES),
      set: (v) => setStorage(SCOPES, v),
      clear: () => clearStorage(SCOPES),
    },
    token: {
      get: () => getStorage(TOKEN),
      set: (v) => setStorage(TOKEN, v),
      clear: () => clearStorage(TOKEN),
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
};

export const { stackScriptInProgress, supportTicket, ticketReply } = storage;

// Only return these if the dev tools are enabled and we're in development mode.
export const getEnvLocalStorageOverrides = () => {
  // This is broken into two logical branches so that local storage is accessed
  // ONLY if the dev tools are enabled and it's a development build.
  if (ENABLE_DEV_TOOLS && import.meta.env.DEV) {
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

export const clearUserInput = () => {
  supportTicket.set(supportTicketStorageDefaults);
  ticketReply.set({ text: '', ticketId: -1 });
  stackScriptInProgress.set({
    description: '',
    id: '',
    images: [],
    label: '',
    rev_note: '',
    script: '',
    updated: '',
  });
};
