import { useScrollTrigger } from '@mui/material';
import React from 'react';

import { FOOTER_HEIGHT } from 'src/features/Footer';
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
  const [isPageScrollable, setIsPageScrollable] = React.useState(true);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        if (!contentRef.current) {
          return;
        }

        const contentHeight = contentRef.current.scrollHeight;
        const windowHeight = window.innerHeight;

        setIsPageScrollable(contentHeight > windowHeight);
      });
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }, [contentRef]);

  return { isPageScrollable };
};

/**
 * This hook is used to determine if the window is at the bottom of the page.
 * It is used to adjust the position of the pin menu button with the footer.
 */
export const useIsWindowAtBottom = () => {
  const isAtBottom = useScrollTrigger({
    disableHysteresis: true,
    target: window,
    threshold:
      document.documentElement.scrollHeight -
      window.innerHeight -
      FOOTER_HEIGHT,
  });

  return { isAtBottom };
};
