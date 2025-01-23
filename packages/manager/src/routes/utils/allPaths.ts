import type { AnyRouter } from '@tanstack/react-router';

/**
 * This function is meant to be used for testing purposes only.
 * It allows us to generate a list of all unique @tanstack/router paths defined in the routing factory.
 *
 * We import this util in routes.test.tsx to loop through all routes and test them.
 * It probably should not be used for anything else than testing.
 *
 * TODO: Tanstack Router - replace AnyRouter once migration is complete.
 */
export const getAllRoutePaths = (router: AnyRouter): string[] => {
  return router.flatRoutes
    .map((route) => {
      let path: string = route.id;
      // Replace dynamic segments with placeholders
      path = path.replace(/\/\$(\w+)/g, (_, segment) => {
        if (segment.toLowerCase().includes('id')) {
          return '/1';
        } else {
          return `/mock-${segment}`;
        }
      });

      return path;
    })
    .filter((path) => path !== '/')
    .filter(Boolean);
};
