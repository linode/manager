import React from 'react';
import { debounce } from 'throttle-debounce';

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
 * A hook to provide scrolling information relative to the viewport
 *
 * documentHeight - the height of the document
 * isAtBottom - whether the user is at the bottom of the viewport
 * isAtTop - whether the user is at the top of the viewport
 * scrollTop - the current scroll position
 * windowHeight - the height of the window
 *
 * @returns {boolean}
 */
export const useScrollingUtils = () => {
  const [isAtBottom, setIsAtBottom] = React.useState(false);
  const [isAtTop, setIsAtTop] = React.useState(false);
  let windowHeight = 0;
  let documentHeight = 0;
  let scrollTop = 0;

  const checkIfBottom = React.useCallback(
    debounce(10, () => {
      windowHeight = window.innerHeight;
      documentHeight = document.documentElement.scrollHeight;
      scrollTop = window.scrollY;
      const bottom = Math.ceil(windowHeight + scrollTop) >= documentHeight;
      const top = scrollTop === 0;

      setIsAtBottom(bottom);
      setIsAtTop(top);
    }),
    []
  );

  React.useEffect(() => {
    checkIfBottom();
    const onScroll = () => requestAnimationFrame(checkIfBottom);
    document.body.onscroll = onScroll;
    return () => {
      document.body.onscroll = null;
    };
  }, [checkIfBottom]);

  return { documentHeight, isAtBottom, isAtTop, scrollTop, windowHeight };
};
