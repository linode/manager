/* eslint-disable no-unused-expressions */
import { createContext, useCallback, useState } from 'react';

export interface NotificationContextProps {
  closeMenu: () => void;
  menuOpen: boolean;
  openMenu: () => void;
}

const defaultContext = {
  closeMenu: () => null,
  menuOpen: false,
  openMenu: () => null,
};

export const notificationContext = createContext<NotificationContextProps>(
  defaultContext
);

export const menuId = 'notification-events-menu';
export const menuButtonId = 'menu-button--notification-events-menu';

export const useNotificationContext = (): NotificationContextProps => {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => {
    document.getElementById(menuId)?.parentElement?.removeAttribute('hidden');
    document
      .getElementById(menuButtonId)
      ?.setAttribute('aria-expanded', 'true');
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    document.getElementById(menuId)?.parentElement?.setAttribute('hidden', '');
    document.getElementById(menuButtonId)?.removeAttribute('aria-expanded');
    setMenuOpen(false);
  }, []);

  return {
    closeMenu,
    menuOpen,
    openMenu,
  };
};
