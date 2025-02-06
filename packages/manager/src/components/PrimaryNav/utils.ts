import React from 'react';

import { TOPMENU_HEIGHT } from 'src/features/TopMenu/constants';
import { isPathOneOf } from 'src/utilities/routing/isPathOneOf';

export const linkIsActive = (
  href: string,
  locationSearch: string,
  locationPathname: string,
  activeLinks: Array<string> = []
) => {
  const currentlyOnOneClickTab = locationSearch.match(/one-click/gi);
  const isOneClickTab = href.match(/one-click/gi);

  /**
   * mark as active if the tab is "one click"
   * Other create tabs default back to Linodes active tabs
   */
  if (currentlyOnOneClickTab) {
    return isOneClickTab;
  }

  return isPathOneOf([href, ...activeLinks], locationPathname);
};

/**
 * This hook is used to determine if the page is scrollable.
 * It is used to determine if the side menu should be sticky.
 */
export const useIsPageScrollable = (
  contentRef: React.RefObject<HTMLElement>
): { isPageScrollable: boolean } => {
  const [isPageScrollable, setIsPageScrollable] = React.useState(false);

  const checkIfScrollable = React.useCallback(() => {
    if (!contentRef.current) {
      return;
    }

    const contentHeight = contentRef.current.scrollHeight;
    const viewportHeight = document.documentElement.clientHeight;
    setIsPageScrollable(contentHeight + TOPMENU_HEIGHT > viewportHeight);
  }, [contentRef]);

  React.useEffect(() => {
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(checkIfScrollable);
    });

    const viewportObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkIfScrollable);
    });

    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      viewportObserver.observe(document.documentElement);
    }

    checkIfScrollable();

    return () => {
      mutationObserver.disconnect();
      viewportObserver.disconnect();
    };
  }, [contentRef, checkIfScrollable]);

  return { isPageScrollable };
};
