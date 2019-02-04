import * as Cookies from 'js-cookie';

export const getStorage = (key: string, fallback?: any) => {
  const item = window.localStorage.getItem(key);
  /*
   * Basically, if localstorage doesn't exist,
   * return whatever we set as a fallback
   */
  if (item === null && !!fallback) {
    return fallback;
  }

  try {
    return JSON.parse(item as any);
  } catch (e) {
    return item;
  }
};

export const setStorage = (key: string, value: string) => {
  return window.localStorage.setItem(key, value);
};

const THEME = 'themeChoice';
const BETA_NOTIFICATION = 'BetaNotification';
const LINODE_VIEW = 'linodesViewStyle';
const GROUP_LINODES = 'GROUP_LINODES';
const HIDE_DISPLAY_GROUPS_CTA = 'importDisplayGroupsCTA';
const HAS_IMPORTED_GROUPS = 'hasImportedGroups';
const GROUP_DOMAINS = `GROUP_DOMAINS`;
const GROUP_NODEBALANCERS = `GROUP_NODEBALANCERS`;
const GROUP_VOLUMES = `GROUP_VOLUMES`;
const BACKUPSCTA_DISMISSED = 'BackupsCtaDismissed';

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
      get: () => 'true' | 'false';
      set: (v: 'true' | 'false') => void;
    };
  };
  loginCloudManager: {
    get: () => undefined | string;
    set: (v: string | object, options?: Cookies.CookieAttributes) => void;
  };
  hideGroupImportCTA: {
    get: () => 'true' | 'false';
    set: () => void;
  };
  hasImportedGroups: {
    get: () => 'true' | 'false';
    set: () => void;
  };
  groupDomainsByTag: {
    get: () => boolean;
    set: (v: 'true' | 'false') => void;
  };
  groupNodeBalancersByTag: {
    get: () => boolean;
    set: (v: 'true' | 'false') => void;
  };
  groupVolumesByTag: {
    get: () => boolean;
    set: (v: 'true' | 'false') => void;
  };
  BackupsCtaDismissed: {
    get: () => boolean;
    set: (v: 'true' | 'false') => void;
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
    set: () => setStorage(HIDE_DISPLAY_GROUPS_CTA, 'true')
  },
  hasImportedGroups: {
    get: () => getStorage(HAS_IMPORTED_GROUPS),
    set: () => setStorage(HAS_IMPORTED_GROUPS, 'true')
  },
  groupDomainsByTag: {
    get: () => getStorage(GROUP_DOMAINS),
    set: v => setStorage(GROUP_DOMAINS, v)
  },
  groupNodeBalancersByTag: {
    get: () => getStorage(GROUP_NODEBALANCERS),
    set: v => setStorage(GROUP_NODEBALANCERS, v)
  },
  groupVolumesByTag: {
    get: () => getStorage(GROUP_VOLUMES),
    set: v => setStorage(GROUP_VOLUMES, v)
  },
  BackupsCtaDismissed: {
    get: () => getStorage(BACKUPSCTA_DISMISSED),
    set: () => setStorage(BACKUPSCTA_DISMISSED, 'true')
  }
};

export const { theme, notifications, views } = storage;
