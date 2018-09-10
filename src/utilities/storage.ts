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
}

export const setStorage = (key: string, value: string) => {
  return window.localStorage.setItem(key, value);
}

const THEME = 'themeChoice';
const BETA_NOTIFICATION = 'BetaNotification';
const LINODE_VIEW = 'linodesViewStyle';

type Theme = 'dark' | 'light';
type Beta = 'open' | 'closed';
type LinodeView = 'grid' | 'list';

export const storage = {
  theme: {
    get: (): Theme => getStorage(THEME, 'light'),
    set: (whichTheme: Theme) => setStorage(THEME, whichTheme),
  },
  notifications: {
    beta: {
      get: (): Beta => getStorage(BETA_NOTIFICATION, 'open'),
      set: (open: Beta) => setStorage(BETA_NOTIFICATION, open),
    }
  },
  views: {
    linode: {
      get: (): LinodeView => getStorage(LINODE_VIEW),
      set: (view: LinodeView) => setStorage(LINODE_VIEW, view),
    }
  }
}

export const { theme, notifications, views } = storage;