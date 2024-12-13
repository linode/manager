import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DomainsRoute } from './DomainsRoute';

export interface DomainsSearchParams {
  recordError?: string;
}

const domainAction = {
  clone: 'clone',
  delete: 'delete',
  disable: 'disable',
  edit: 'edit',
  import: 'import',
} as const;

export type DomainAction = typeof domainAction[keyof typeof domainAction];

const domainsRoute = createRoute({
  component: DomainsRoute,
  getParentRoute: () => rootRoute,
  path: 'domains',
});

const domainsIndexRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: '/',
  validateSearch: (search: DomainsSearchParams) => search,
}).lazy(() =>
  import('./domainsLazyRoutes').then((m) => m.domainsLandingLazyRoute)
);

const domainCreateRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: 'create',
}).lazy(() =>
  import('./domainsLazyRoutes').then((m) => m.createDomainLazyRoute)
);

const domainDetailRoute = createRoute({
  getParentRoute: () => domainsRoute,
  parseParams: (params) => ({
    domainId: Number(params.domainId),
  }),
  path: '$domainId',
}).lazy(() =>
  import('./domainsLazyRoutes').then((m) => m.domainDetailLazyRoute)
);

const domainDetailRecordsRoute = createRoute({
  getParentRoute: () => domainDetailRoute,
  // unsure this path is needed, but added for legacy purposes
  path: 'records',
}).lazy(() =>
  import('./domainsLazyRoutes').then((m) => m.domainDetailLazyRoute)
);

type DomainActionRouteParams<P = number | string> = {
  action: DomainAction;
  domainId: P;
};

const domainActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in domainAction)) {
      throw redirect({
        search: () => ({}),
        to: '/domains',
      });
    }
  },
  getParentRoute: () => domainsRoute,
  params: {
    parse: ({ action, domainId }: DomainActionRouteParams<string>) => ({
      action,
      domainId: Number(domainId),
    }),
    stringify: ({ action, domainId }: DomainActionRouteParams<number>) => ({
      action,
      domainId: String(domainId),
    }),
  },
  path: '$domainId/$action',
  validateSearch: (search: DomainsSearchParams) => search,
}).lazy(() =>
  import('./domainsLazyRoutes').then((m) => m.domainsLandingLazyRoute)
);

export const domainsRouteTree = domainsRoute.addChildren([
  domainsIndexRoute.addChildren([domainActionRoute]),
  domainCreateRoute,
  domainDetailRoute.addChildren([domainDetailRecordsRoute]),
]);
