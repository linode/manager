import isPathOneOf from 'src/utilities/routing/isPathOneOf';

export const linkIsActive = (href: string) => {
  return isPathOneOf([href], location.pathname);
};
