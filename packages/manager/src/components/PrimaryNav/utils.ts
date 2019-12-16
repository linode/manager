import isPathOneOf from 'src/utilities/routing/isPathOneOf';

export const linkIsActive = (href: string, activeLinks?: Array<string>) => {
  return !activeLinks
    ? href && isPathOneOf([href], location.pathname)
    : isPathOneOf(activeLinks, location.pathname);
};
