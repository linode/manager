export const generateCrumbOverrides = (pathname: string) => {
  const pathParts = pathname.split('/').filter(Boolean);
  const lastTwoParts = pathParts.slice(-2);
  const fullPaths: string[] = [];

  pathParts.forEach((_, index) => {
    fullPaths.push('/' + pathParts.slice(0, index + 1).join('/'));
  });

  const overrides = lastTwoParts.map((part, index) => ({
    label: part,
    linkTo: fullPaths[pathParts.length - 2 + index],
    position: index + 1,
  }));

  return { newPathname: '/' + lastTwoParts.join('/'), overrides };
};
