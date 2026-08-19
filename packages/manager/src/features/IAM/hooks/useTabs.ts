import { useMatchRoute, useNavigate, useRouter } from '@tanstack/react-router';
import * as React from 'react';

import type { TabsElement } from '@akamai/cds-components/react';
import type { LinkProps } from '@tanstack/react-router';

/**
 * Internal CDS `TabsElement` API used to programmatically activate a tab.
 * `_activateTab` is not part of the public interface; this type bridges the
 * gap until CDS exposes a first-class imperative API.
 * @see UIE-11316
 */
type TabsElementInternal = {
  _activateTab?: (index: number) => void;
};

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

export function useTabs<T extends Tab>(
  tabs: T[],
  tabsRef?: React.RefObject<null | TabsElement>
) {
  const navigate = useNavigate();
  const router = useRouter();
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
      return matchRoute({
        fuzzy: true,
        to: tabPath,
      });
    });
    return index === -1 ? 0 : index;
  }, [visibleTabs, matchRoute]);

  const activateCurrentTab = React.useCallback(() => {
    const el = tabsRef?.current as unknown as null | TabsElementInternal;
    el?._activateTab?.(tabIndex);
  }, [tabIndex, tabsRef]);

  const handleTabChange = React.useCallback(
    (index: number) => {
      const tab = visibleTabs[index];
      // Guard: if the tab's route is already active (e.g. triggered by our own
      // programmatic _activateTab call below), skip navigating to avoid loops.
      if (tab && !matchRoute({ fuzzy: true, to: String(tab.to) })) {
        // CDS updates active visuals on click before route transition completes.
        // Re-activate the current-route tab so blocked navigation can't leave
        // the wrong tab highlighted.
        activateCurrentTab();
        navigate({ to: tab.to });
      }
    },
    [visibleTabs, navigate, matchRoute, activateCurrentTab]
  );

  // Preload route bundles on hover, restoring the prefetch behaviour of
  // TanStack <Link preload="intent">. CDS renders tab header buttons inside
  // its shadow DOM, so we use event delegation on the shadow root (which
  // persists for the element lifetime) rather than attaching to individual
  // buttons (which Lit may replace on re-render).
  React.useEffect(() => {
    const shadowRoot = tabsRef?.current?.shadowRoot;
    if (!shadowRoot) return;

    const handleMouseOver = (e: Event) => {
      const buttons = Array.from(shadowRoot.querySelectorAll('button'));
      const index = buttons.indexOf(e.target as HTMLButtonElement);
      const tab = visibleTabs[index];
      if (tab) {
        router.preloadRoute({ to: tab.to }).catch(() => undefined);
      }
    };

    shadowRoot.addEventListener('mouseover', handleMouseOver);
    return () => {
      shadowRoot.removeEventListener('mouseover', handleMouseOver);
    };
  }, [visibleTabs, router, tabsRef]);

  // CDS owns its internal active-tab state and only reliably re-syncs its
  // header buttons through its own _activateTab method. When the active tab
  // changes due to external navigation (e.g. a post-submit redirect), we call
  // _activateTab directly after React commits. The guard in handleTabChange
  // prevents the resulting tabs-change event from triggering a navigate loop.
  React.useEffect(() => {
    // Cast through unknown: `_activateTab` is private on TabsElement, so
    // intersection fails at the type level. TabsElementInternal documents the
    // shape we rely on; `unknown` is the only valid escape hatch here.
    activateCurrentTab();
  }, [activateCurrentTab]);

  return {
    handleTabChange,
    tabIndex,
    tabs: visibleTabs,
    getTabIndex,
  };
}
