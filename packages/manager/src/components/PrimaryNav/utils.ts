import React from 'react';

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

export const useScrollable = (
  contentRef: React.RefObject<HTMLElement>
): {
  isPageAtBottom: boolean;
  isPageScrollable: boolean;
} => {
  const [isPageScrollable, setIsPageScrollable] = React.useState(false);
  const [isPageAtBottom, setIsPageAtBottom] = React.useState(false);

  const checkIfPageAtBottom = React.useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const bottom = Math.ceil(windowHeight + scrollTop) >= documentHeight;

    setIsPageAtBottom(bottom);
  }, []);

  React.useEffect(() => {
    // Initial check
    checkIfPageAtBottom();

    // Set up scroll listener
    const onScroll = () => requestAnimationFrame(checkIfPageAtBottom);
    document.body.onscroll = onScroll;

    // Set up mutation observer
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        if (!contentRef.current) {
          return;
        }

        const contentHeight = contentRef.current.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        setIsPageScrollable(contentHeight > windowHeight);
        setIsPageAtBottom(Math.ceil(windowHeight + scrollTop) >= contentHeight);
      });
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    // Cleanup
    return () => {
      document.body.onscroll = null;
      observer.disconnect();
    };
  }, [contentRef, checkIfPageAtBottom]);

  return { isPageAtBottom, isPageScrollable };
};
