import isPathOneOf from 'src/utilities/routing/isPathOneOf';

export const linkIsActive = (href: string) => {
  const currentlyOnOneClickPage = location.search.match(/one-click/gi);
  const isOneClickTab = href.match(/one-click/gi);

  /** one click and linodes have similar pathnames so make sure their not both marked active */
  if (currentlyOnOneClickPage) {
    if (isOneClickTab) {
      return true;
    }
    return false;
  }

  return isPathOneOf([href], location.pathname);
};
