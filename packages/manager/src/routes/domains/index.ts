import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DomainsRoutes } from './DomainsRoute';

const domainsRoute = createRoute({
  component: DomainsRoutes,
  getParentRoute: () => rootRoute,
  path: 'domains',
});

const domainsIndexRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Domains/DomainsLanding').then(
    (m) => m.domainsLandingLazyRoute
  )
);

const domainCreateRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Domains/CreateDomain/CreateDomain').then(
    (m) => m.createDomainLazyRoute
  )
);

const domainDetailRoute = createRoute({
  getParentRoute: () => domainsRoute,
  parseParams: (params) => ({
    domainId: Number(params.domainId),
  }),
  path: '$domainId',
}).lazy(() =>
  import('src/features/Domains/DomainDetail').then(
    (m) => m.domainDetailLazyRoute
  )
);

const domainDetailRecordsRoute = createRoute({
  getParentRoute: () => domainDetailRoute,
  // unsure this path is needed, but added for legacy purposes
  path: 'records',
}).lazy(() =>
  import('src/features/Domains/DomainDetail').then(
    (m) => m.domainDetailLazyRoute
  )
);

export const domainsRouteTree = domainsRoute.addChildren([
  domainsIndexRoute,
  domainCreateRoute,
  domainDetailRoute.addChildren([domainDetailRecordsRoute]),
]);
