import * as Cookies from 'js-cookie';
import ErrorClass from 'src/ErrorClass';
import * as Store from 'store';

export class LocalStorageAccessError extends ErrorClass {
  constructor(message?: string) {
    super(message);
    this.name = `LocalStorageAccessError`;
  }
}

export const getStorage = (key: string, fallback?: any) => {
  try {
    return Store.get(key, fallback);
  } catch (error) {
    throw new LocalStorageAccessError(
      `Unable to access key ${key} from storage.`
    );
  }
};

export const setStorage = (key: string, value: any) => {
  try {
    return Store.set(key, value);
  } catch (error) {
    throw new LocalStorageAccessError(
      `Unable to access key ${key} from storage.`
    );
  }
};

const THEME = 'themeChoice';
const BETA_NOTIFICATION = 'BetaNotification';
const LINODE_VIEW = 'linodesViewStyle';
const GROUP_LINODES = 'GROUP_LINODES';
const HIDE_DISPLAY_GROUPS_CTA = 'importDisplayGroupsCTA';
const HAS_IMPORTED_GROUPS = 'hasImportedGroups';
const GROUP_DOMAINS = `GROUP_DOMAINS`;

type Theme = 'dark' | 'light';
type Beta = 'open' | 'closed';
type LinodeView = 'grid' | 'list';

export interface Storage {
  theme: {
    get: () => Theme;
    set: (theme: Theme) => void;
  };
  notifications: {
    welcome: {
      get: () => Beta;
      set: (open: Beta) => void;
    };
  };
  views: {
    linode: {
      get: () => LinodeView;
      set: (view: LinodeView) => void;
    };
    grouped: {
      get: () => boolean;
      set: (v: boolean) => void;
    };
  };
  loginCloudManager: {
    get: () => undefined | string;
    set: (v: string | object, options?: Cookies.CookieAttributes) => void;
  };
  hideGroupImportCTA: {
    get: () => boolean;
    set: () => void;
  };
  hasImportedGroups: {
    get: () => boolean;
    set: () => void;
  };
  groupDomainsByTag: {
    get: () => boolean;
    set: (v: boolean) => void;
  };
}

export const storage: Storage = {
  theme: {
    get: () => getStorage(THEME, 'light'),
    set: v => setStorage(THEME, v)
  },
  notifications: {
    welcome: {
      /** Leaving the LS key alone so it's not popping for those who've dismissed it. */
      get: () => getStorage(BETA_NOTIFICATION, 'open'),
      set: open => setStorage(BETA_NOTIFICATION, open)
    }
  },
  views: {
    linode: {
      get: (): LinodeView => getStorage(LINODE_VIEW),
      set: (view: LinodeView) => setStorage(LINODE_VIEW, view)
    },
    grouped: {
      get: () => getStorage(GROUP_LINODES),
      set: v => setStorage(GROUP_LINODES, v)
    }
  },
  loginCloudManager: {
    get: () => Cookies.get('loginCloudManager'),
    set: (
      v: string | object,
      options: Cookies.CookieAttributes = {
        domain: '.linode.com',
        expires: 1000 * 60 * 60 * 24 * 356
      }
    ) => Cookies.set('loginCloudManager', v, options)
  },
  hideGroupImportCTA: {
    get: () => getStorage(HIDE_DISPLAY_GROUPS_CTA),
    set: () => setStorage(HIDE_DISPLAY_GROUPS_CTA, true)
  },
  hasImportedGroups: {
    get: () => getStorage(HAS_IMPORTED_GROUPS),
    set: () => setStorage(HAS_IMPORTED_GROUPS, true)
  },
  groupDomainsByTag: {
    get: () => getStorage(GROUP_DOMAINS),
    set: v => setStorage(GROUP_DOMAINS, v)
  }
};

export const { theme, notifications, views } = storage;
