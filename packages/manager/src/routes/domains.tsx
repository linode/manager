import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const DomainsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Domains" />
      <Outlet />
    </React.Suspense>
  );
};

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
