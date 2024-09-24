import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
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
  component: lazyRouteComponent(() =>
    import('src/features/Domains/DomainsLanding').then((module) => ({
      default: module.DomainsLanding,
    }))
  ),
  getParentRoute: () => domainsRoute,
  path: '/',
});

const domainCreateRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Domains/CreateDomain/CreateDomain').then((module) => ({
      default: module.CreateDomain,
    }))
  ),
  getParentRoute: () => domainsRoute,
  path: 'create',
});

const domainDetailRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Domains/DomainDetail').then((module) => ({
      default: module.DomainDetailRouting,
    }))
  ),
  getParentRoute: () => domainsRoute,
  parseParams: (params) => ({
    domainId: Number(params.domainId),
  }),
  path: '$domainId',
});

const domainDetailRecordsRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Domains/DomainDetail').then((module) => ({
      default: module.DomainDetailRouting,
    }))
  ),
  getParentRoute: () => domainDetailRoute,
  path: 'records',
});

export const domainsRouteTree = domainsRoute.addChildren([
  domainsIndexRoute,
  domainCreateRoute,
  domainDetailRoute.addChildren([domainDetailRecordsRoute]),
]);
