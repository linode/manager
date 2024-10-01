import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const ObjectStorageRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Object Storage" />
      <Outlet />
    </React.Suspense>
  );
};

export const objectStorageRoute = createRoute({
  component: ObjectStorageRoutes,
  getParentRoute: () => rootRoute,
  path: 'object-storage',
});

const objectStorageIndexRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: '/',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketsRoute = createRoute({
  getParentRoute: () => objectStorageIndexRoute,
  path: 'buckets',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeysRoute = createRoute({
  getParentRoute: () => objectStorageIndexRoute,
  path: 'access-keys',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketDetailRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: '$clusterId/$bucketName',
}).lazy(() =>
  import('src/features/ObjectStorage/BucketDetail').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketCreateRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

export const objectStorageRouteTree = objectStorageRoute.addChildren([
  objectStorageIndexRoute,
  objectStorageBucketsRoute,
  objectStorageBucketCreateRoute,
  objectStorageBucketDetailRoute,
  objectStorageAccessKeysRoute,
]);
