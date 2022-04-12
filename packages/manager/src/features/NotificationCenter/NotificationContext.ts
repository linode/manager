import { createContext, useCallback, useState } from 'react';

export interface NotificationContextProps {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const defaultContext = {
  menuOpen: false,
  openMenu: () => null,
  closeMenu: () => null,
  toggleMenu: () => null,
};

export const notificationContext = createContext<NotificationContextProps>(
  defaultContext
);

export const useNotificationContext = (): NotificationContextProps => {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(
    () => setMenuOpen((menuOpen) => !menuOpen),
    []
  );

  return {
    menuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
};
