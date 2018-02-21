import { matchPath, RouteProps } from 'react-router-dom';

/**
 *
 * @param {Array<string>} paths Haystack.
 * @param {string} pathname Needle.
 * @param {Object} [props] matchPath arguments.
 * @return {Boolean}
 */
export default (paths: string[], pathname: string, props?: RouteProps): Boolean => {
  return paths.reduce(
    (result, path) => {
      return result || Boolean(matchPath(pathname, { ...props, path }));
    },
    false,
  );
};
