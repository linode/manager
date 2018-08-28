export const getStorage = (key: string) => {
  const item = window.localStorage.getItem(key);
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

export const storage = {
  theme: {
    isDarkTheme: getStorage(THEME) === 'dark',
    setLightTheme: () => setStorage(THEME, 'light'),
    setDarkTheme: () => setStorage(THEME, 'dark'),
  },
  notifications: {
    beta: {
      isOpen: getStorage(BETA_NOTIFICATION) !== 'closed',
      close: () => setStorage(BETA_NOTIFICATION, 'closed'),
    }
  },
  views: {
    linode: {
      isGridView: getStorage(LINODE_VIEW) === 'grid',
      isListView: getStorage(LINODE_VIEW) === 'list',
      setGridView: () => setStorage(LINODE_VIEW, 'grid'),
      setListView: () => setStorage(LINODE_VIEW, 'list'),
    }
  }
}

export const { theme, notifications, views } = storage;