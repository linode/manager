import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/Domains/DomainsLanding'),
    'DomainsLanding'
  ),
  getParentRoute: () => domainsRoute,
  path: '/',
});

const domainCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Domains/CreateDomain/CreateDomain'),
    'CreateDomain'
  ),
  getParentRoute: () => domainsRoute,
  path: 'create',
});

const domainDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Domains/DomainDetail'),
    'DomainDetailRouting'
  ),
  getParentRoute: () => domainsRoute,
  parseParams: (params) => ({
    domainId: Number(params.domainId),
  }),
  path: '$domainId',
});

const domainDetailRecordsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Domains/DomainDetail'),
    'DomainDetailRouting'
  ),
  getParentRoute: () => domainDetailRoute,
  path: 'records',
});

export const domainsRouteTree = domainsRoute.addChildren([
  domainsIndexRoute,
  domainCreateRoute,
  domainDetailRoute.addChildren([domainDetailRecordsRoute]),
]);
