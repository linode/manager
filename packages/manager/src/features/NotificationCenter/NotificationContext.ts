import { createContext, useCallback, useState } from 'react';

export interface NotificationContextProps {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const defaultContext = {
  drawerOpen: false,
  openDrawer: () => null,
  closeDrawer: () => null,
  toggleDrawer: () => null,
};

export const notificationContext = createContext<NotificationContextProps>(
  defaultContext
);

export const useNotificationContext = (): NotificationContextProps => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(
    () => setDrawerOpen((drawerOpen) => !drawerOpen),
    []
  );

  return {
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};
