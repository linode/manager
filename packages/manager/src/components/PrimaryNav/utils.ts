import isPathOneOf from 'src/utilities/routing/isPathOneOf';

export const linkIsActive = (href: string, activeLinks?: Array<string>) => {
  const currentlyOnCreateLinodeFlow = location.pathname.match(
    /linodes[/]create/gi
  );
  const currentlyOnOneClickTab = location.search.match(/one-click/gi);
  const isOneClickTab = href && href.match(/one-click/gi);

  /**
   * mark as active if the tab is "one click" and we're on the one-click route
   * any other create flow tabs don't need an active nav element
   */
  if (currentlyOnCreateLinodeFlow) {
    if (currentlyOnOneClickTab) {
      return isOneClickTab;
    }
    return false;
  }

  return !activeLinks
    ? href && isPathOneOf([href], location.pathname)
    : isPathOneOf(activeLinks, location.pathname);
};
