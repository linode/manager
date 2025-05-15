import type { RouteProps } from 'react-router-dom';
import { matchPath } from 'react-router-dom';

/**
 *
 * @param paths Haystack.
 * @param pathname Needle.
 * @param matchPath arguments.
 */
export const isPathOneOf = (
  paths: string[],
  pathname: string,
  props?: RouteProps
): boolean => {
  return paths.reduce((result, path) => {
    return result || Boolean(matchPath(pathname, { ...props, path }));
  }, false);
};
