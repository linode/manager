import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DomainsRoute } from './DomainsRoute';

import type { TableSearchParams } from '../types';
import { mainContentRoute } from '../mainContent';

export type DomainsSearchParams = TableSearchParams;

export type DomainState = {
  recordError?: string;
};

const domainAction = {
  clone: 'clone',
  delete: 'delete',
  disable: 'disable',
  edit: 'edit',
} as const;

export type DomainAction = (typeof domainAction)[keyof typeof domainAction];

const domainsRoute = createRoute({
  component: DomainsRoute,
  getParentRoute: () => mainContentRoute,
  path: 'domains',
});

const domainsIndexRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: '/',
  validateSearch: (search: DomainsSearchParams) => search,
}).lazy(() =>
  import('src/features/Domains/domainsLandingLazyRoute').then(
    (m) => m.domainsLandingLazyRoute
  )
);

const domainCreateRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Domains/CreateDomain/createDomainLazyRoute').then(
    (m) => m.createDomainLazyRoute
  )
);

const domainImportRoute = createRoute({
  getParentRoute: () => domainsRoute,
  path: 'import',
}).lazy(() =>
  import('src/features/Domains/domainsLandingLazyRoute').then(
    (m) => m.domainsLandingLazyRoute
  )
);

const domainDetailRoute = createRoute({
  getParentRoute: () => domainsRoute,
  parseParams: (params) => ({
    domainId: Number(params.domainId),
  }),
  path: '$domainId',
}).lazy(() =>
  import('src/features/Domains/DomainDetail/domainDetailLazyRoute').then(
    (m) => m.domainDetailLazyRoute
  )
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
  import('src/features/Domains/domainsLandingLazyRoute').then(
    (m) => m.domainsLandingLazyRoute
  )
);

export const domainsRouteTree = domainsRoute.addChildren([
  domainsIndexRoute.addChildren([domainActionRoute]),
  domainCreateRoute,
  domainImportRoute,
  domainDetailRoute,
]);
