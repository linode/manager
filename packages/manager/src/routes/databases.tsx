import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const DatabasesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <ProductInformationBanner bannerLocation="Databases" />
      <Outlet />
    </React.Suspense>
  );
};

const databasesRoute = createRoute({
  component: DatabasesRoutes,
  getParentRoute: () => rootRoute,
  path: 'databases',
});

const databasesIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseLanding')
  ),
  getParentRoute: () => databasesRoute,
  path: '/',
});

const databasesCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseCreate')
  ),
  getParentRoute: () => databasesRoute,
  path: 'create',
});

const databasesDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseDetail')
  ),
  getParentRoute: () => databasesRoute,
  parseParams: (params) => ({
    databaseId: Number(params.databaseId),
    engine: params.engine,
  }),
  path: '$engine/$databaseId',
});

const databasesDetailSummaryRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseDetail/DatabaseSummary')
  ),
  getParentRoute: () => databasesDetailRoute,
  path: 'summary',
});

const databasesDetailBackupsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseDetail/DatabaseBackups')
  ),
  getParentRoute: () => databasesDetailRoute,
  path: 'backups',
});

const databasesDetailResizeRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import(
        'src/features/Databases/DatabaseDetail/DatabaseResize/DatabaseResize'
      ),
    'DatabaseResize'
  ),
  getParentRoute: () => databasesDetailRoute,
  path: 'resize',
});

const databasesDetailSettingsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Databases/DatabaseDetail/DatabaseSettings')
  ),
  getParentRoute: () => databasesDetailRoute,
  path: 'settings',
});

export const databasesRouteTree = databasesRoute.addChildren([
  databasesIndexRoute,
  databasesCreateRoute,
  databasesDetailRoute.addChildren([
    databasesDetailSummaryRoute,
    databasesDetailBackupsRoute,
    databasesDetailResizeRoute,
    databasesDetailSettingsRoute,
  ]),
]);
