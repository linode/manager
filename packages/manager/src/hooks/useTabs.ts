import { useMatchRoute, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import type { LinkProps } from '@tanstack/react-router';

export interface Tab {
  /**
   * The chip to display in the tab (a helper icon if disabled for instance).
   */
  chip?: null | React.JSX.Element;
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

/**
 * This hook is a necessary evil to sync routing and tabs,
 * since Reach Tabs maintains its own index state.
 */
export function useTabs<T extends Tab>(tabs: T[]) {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  // Filter out hidden tabs
  const visibleTabs = React.useMemo(
    () => tabs.filter((tab) => !tab.hide),
    [tabs]
  );

  // Calculate current index based on route
  const tabIndex = React.useMemo(() => {
    const index = visibleTabs.findIndex((tab) => {
      const tabPath = String(tab.to);
      // Check if current route starts with the tab's base path
      return matchRoute({
        fuzzy: true, // Allows to match parent routes
        to: tabPath,
      });
    });
    return index === -1 ? 0 : index;
  }, [visibleTabs, matchRoute]);

  const handleTabChange = React.useCallback(
    (index: number) => {
      const tab = visibleTabs[index];
      if (tab) {
        navigate({ to: tab.to });
      }
    },
    [visibleTabs, navigate]
  );

  return {
    handleTabChange,
    tabIndex,
    tabs: visibleTabs,
  };
}
