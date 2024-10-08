import { routeTree } from '..';

import type { AnyRoute } from '@tanstack/react-router';

/**
 * This function is meant to be used for testing purposes only.
 * It allows us to generate a list of all unique @tanstack/router paths defined in the routing factory.
 *
 * We import this util in cypress to loop through all routes and test them.
 * It probably should not be used for anything else.
 */
export const getAllRoutePaths = (
  route: AnyRoute,
  parentPath = ''
): string[] => {
  let currentPath = parentPath
    ? `${parentPath}/${route.path || ''}`
    : route.path || '';

  // Remove leading and trailing slashes
  currentPath = currentPath.replace(/^\/+|\/+$/g, '');

  const paths = new Set<string>();

  // Check if the current path is valid
  if (currentPath && currentPath !== '//') {
    paths.add('/' + currentPath);
  }

  if (route.children && Array.isArray(route.children)) {
    route.children.forEach((childRoute) => {
      getAllRoutePaths(childRoute, currentPath).forEach((path) =>
        paths.add(path)
      );
    });
  }

  // Replace dynamic segments with mock values
  return Array.from(paths).map((path) =>
    path.replace(/\/\$(\w+)/g, (_, segment) => {
      if (segment.toLowerCase().includes('id')) {
        return '/1';
      } else {
        return `/mock-${segment}`;
      }
    })
  );
};

export const allPaths = getAllRoutePaths(routeTree);
