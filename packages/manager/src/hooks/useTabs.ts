import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import type { LinkProps } from '@tanstack/react-router';

export interface Tab {
  /**
   * The chip to display in the tab (a helper icon if disabled for instance).
   */
  chip?: React.JSX.Element | null;
  /**
   * Whether the tab is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the tab is hidden.
   */
  hide?: boolean;
  /**
   * The icon to display in the tab (a helper icon if disabled for instance).
   */
  icon?: React.ReactNode;
  /**
   * The title of the tab.
   */
  title: string;
  /**
   * The path to navigate to when the tab is clicked.
   */
  to: LinkProps['to'];
}

interface UseTabsOptions {
  /**
   * The index of the tab to select by default.
   */
  defaultIndex?: number;
}

export function useTabs<T extends Tab>(
  tabs: T[],
  options: UseTabsOptions = {}
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultIndex = 0 } = options;
  const visibleTabs = React.useMemo(() => tabs.filter((tab) => !tab.hide), [
    tabs,
  ]);
  const initialIndex = React.useCallback(() => {
    return Math.max(
      visibleTabs.findIndex((tab) => location.pathname === tab.to),
      defaultIndex
    );
  }, [visibleTabs, location.pathname, defaultIndex]);
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const handleTabChange = (index: number) => {
    if (visibleTabs[index]?.disabled) {
      return;
    }

    setCurrentIndex(index);
    navigate({
      to: visibleTabs[index].to,
    });
  };

  return {
    currentIndex,
    handleTabChange,
    tabs: visibleTabs,
  };
}
