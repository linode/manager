import { useMatchRoute } from '@tanstack/react-router';
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

/**
 * This hook is a necessary evil to sync routing and tabs.
 */
export function useTabs<T extends Tab>(tabs: T[]) {
  const matchRoute = useMatchRoute();

  // Filter out hidden tabs
  const visibleTabs = React.useMemo(() => tabs.filter((tab) => !tab.hide), [
    tabs,
  ]);

  // Calculate current index based on route
  const tabIndex = React.useMemo(() => {
    const index = visibleTabs.findIndex((tab) => matchRoute({ to: tab.to }));
    return index === -1 ? 0 : index;
  }, [visibleTabs, matchRoute]);

  // Simple handler to satisfy Reach Tabs props
  const handleTabChange = React.useCallback(() => {
    // No-op - navigation is handled by Tanstack Router `Link`
  }, []);

  return {
    handleTabChange,
    tabIndex,
    tabs: visibleTabs,
  };
}
