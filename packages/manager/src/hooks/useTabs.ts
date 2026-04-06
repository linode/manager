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

  const visibleTabIndices = React.useMemo(() => {
    const indices = new Map<string, number>();
    let visibleIndex = 0;

    tabs.forEach((tab) => {
      if (!tab.hide) {
        indices.set(String(tab.to), visibleIndex);
        visibleIndex++;
      }
    });

    return indices;
  }, [tabs]);

  // This helper function is used to get the index of a tab based on its path.
  // It is meant to be used in the SafeTabPanel component when tabs are conditionally rendered.
  // Without this, the logic to calculate the current index for a tab's content is tedious.
  // In most cases this won't be needed as indexes can be passed statically.
  const getTabIndex = React.useCallback(
    (path: T['to']): null | number => {
      return visibleTabIndices.get(String(path)) ?? null;
    },
    [visibleTabIndices]
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
    getTabIndex,
  };
}
