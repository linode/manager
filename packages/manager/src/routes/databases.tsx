import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

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
  getParentRoute: () => databasesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Databases/DatabaseLanding/DatabaseLanding').then(
    (m) => m.databaseLandingLazyRoute
  )
);

const databasesCreateRoute = createRoute({
  getParentRoute: () => databasesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Databases/DatabaseCreate/DatabaseCreate').then(
    (m) => m.databaseCreateLazyRoute
  )
);

const databasesDetailRoute = createRoute({
  getParentRoute: () => databasesRoute,
  parseParams: (params) => ({
    databaseId: Number(params.databaseId),
    engine: params.engine,
  }),
  path: '$engine/$databaseId',
}).lazy(() =>
  import('src/features/Databases/DatabaseDetail').then(
    (m) => m.databaseDetailLazyRoute
  )
);

const databasesDetailSummaryRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'summary',
}).lazy(() =>
  import('src/features/Databases/DatabaseDetail').then(
    (m) => m.databaseDetailLazyRoute
  )
);

const databasesDetailBackupsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'backups',
}).lazy(() =>
  import('src/features/Databases/DatabaseDetail').then(
    (m) => m.databaseDetailLazyRoute
  )
);

const databasesDetailResizeRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'resize',
}).lazy(() =>
  import('src/features/Databases/DatabaseDetail').then(
    (m) => m.databaseDetailLazyRoute
  )
);

const databasesDetailSettingsRoute = createRoute({
  getParentRoute: () => databasesDetailRoute,
  path: 'settings',
}).lazy(() =>
  import('src/features/Databases/DatabaseDetail').then(
    (m) => m.databaseDetailLazyRoute
  )
);

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
