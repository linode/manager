import { matchPath, RouteProps } from 'react-router-dom';

/**
 *
 * @param paths Haystack.
 * @param pathname Needle.
 * @param matchPath arguments.
 */
export default (
  paths: string[],
  pathname: string,
  props?: RouteProps
): Boolean => {
  return paths.reduce((result, path) => {
    return result || Boolean(matchPath(pathname, { ...props, path }));
  }, false);
};
