import { useMatchRoute, useNavigate } from '@tanstack/react-router';
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

export function useTabs<T extends Tab>(tabs: T[]) {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  // Filter out hidden tabs
  const visibleTabs = React.useMemo(() => tabs.filter((tab) => !tab.hide), [
    tabs,
  ]);
  // Get initial index from route
  const initialIndex = React.useMemo(
    () => visibleTabs.findIndex((tab) => matchRoute({ to: tab.to })),
    [visibleTabs, matchRoute]
  );
  const indexRef = React.useRef(initialIndex);

  const handleTabChange = React.useCallback(
    (index: number) => {
      // 1. Prevent a navigate call if the tab is disabled
      if (visibleTabs[index]?.disabled) {
        return;
      }

      // 2. Update the index
      indexRef.current = index;

      // 3. Update the index and navigate
      navigate({
        to: visibleTabs[indexRef.current].to,
      });
    },
    [visibleTabs, navigate]
  );

  return {
    handleTabChange,
    tabIndex: indexRef.current,
    tabs: visibleTabs,
  };
}
