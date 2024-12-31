import { useRouter } from '@tanstack/react-router';

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
  defaultIndex?: number;
}

export function useTabs<T extends Tab>(
  tabs: T[],
  options: UseTabsOptions = {}
) {
  const router = useRouter();
  const { defaultIndex = 0 } = options;

  const visibleTabs = tabs.filter((tab) => !tab.hide);

  const currentIndex = Math.max(
    visibleTabs.findIndex((tab) => router.state.location.pathname === tab.to),
    defaultIndex
  );

  const handleTabChange = (index: number) => {
    if (visibleTabs[index]?.disabled) {
      return;
    }

    router.navigate({
      to: visibleTabs[index].to,
    });
  };

  return {
    currentIndex,
    handleTabChange,
    tabs: visibleTabs,
  };
}
