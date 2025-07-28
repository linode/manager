import { matchByPath } from '@tanstack/react-router';

import type { LinkProps } from '@tanstack/react-router';

interface RouteProps {
  caseSensitive?: boolean;
  fuzzy?: boolean;
}

/**
 *
 * @param paths Haystack.
 * @param pathname Needle.
 * @param matchPath arguments.
 */
export const isPathOneOf = (
  paths: LinkProps['to'][],
  pathname: string,
  props?: RouteProps
): boolean => {
  return paths.reduce((result, path) => {
    return (
      result ||
      Boolean(
        matchByPath(path ?? '', pathname, {
          to: path,
          caseSensitive: props?.caseSensitive,
          fuzzy: props?.fuzzy,
        })
      )
    );
  }, false);
};
