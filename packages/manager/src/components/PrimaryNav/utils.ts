import React from 'react';

import { TOPMENU_HEIGHT } from 'src/features/TopMenu/constants';

import type { LinkProps } from '@tanstack/react-router';

export const linkIsActive = (locationPathname: string, to: LinkProps['to']) => {
  const marketPlacePath = '/linodes/create/marketplace';
  const currentlyOnOneClickTab = locationPathname === marketPlacePath;
  const isOneClickTab = to?.match(marketPlacePath);

  // Special handling for marketplace tab
  if (currentlyOnOneClickTab || isOneClickTab) {
    return currentlyOnOneClickTab && isOneClickTab;
  }

  return to?.split('/')[1] === locationPathname.split('/')[1];
};

/**
 * This hook is used to determine if the page is scrollable.
 * It is used to determine if the side menu should be sticky.
 */
export const useIsPageScrollable = (
  contentRef: React.RefObject<HTMLElement | null>
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
