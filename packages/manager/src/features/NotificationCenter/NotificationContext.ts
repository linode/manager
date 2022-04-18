/* eslint-disable no-unused-expressions */
import { createContext, useCallback, useEffect, useState } from 'react';

export interface NotificationContextProps {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const defaultContext = {
  menuOpen: false,
  openMenu: () => null,
  closeMenu: () => null,
};

export const notificationContext = createContext<NotificationContextProps>(
  defaultContext
);

export const menuId = 'notification-events-menu';
const menuButtonId = 'menu-button--notification-events-menu';

const hasParentElementById = (
  element: HTMLElement | null,
  id: string
): boolean => {
  if (!element) {
    return false;
  }
  if (element.id === id) {
    return true;
  } else {
    return hasParentElementById(element.parentElement, id);
  }
};

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

  const handleAnyClick = useCallback(
    (e: any) => {
      const clickWasFromInsideMenu = hasParentElementById(
        e.target.parentElement,
        menuId
      );
      // Ignore clicks from inside the menu unless it's a link
      if (clickWasFromInsideMenu && e.target.tagName.toLowerCase() !== 'a') {
        return;
      }
      /**
       * If the user clicks the bell icon while the menu is open,
       * prevent the bell click event from being called
       * otherwise the menu will immediately re-open
       */
      if (
        e.target.nearestViewportElement instanceof SVGElement ||
        e.target.id === menuButtonId
      ) {
        e.stopImmediatePropagation();
      }
      closeMenu();
    },
    [closeMenu]
  );

  useEffect(() => {
    if (menuOpen) {
      // eslint-disable-next-line
      document.addEventListener('click', handleAnyClick, true);

      // clean up the event when the component is re-rendered
      return () => document.removeEventListener('click', handleAnyClick, true);
    } else {
      return () => null;
    }
  }, [handleAnyClick, menuOpen]);

  return {
    menuOpen,
    openMenu,
    closeMenu,
  };
};
