import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/ObjectStorage/ObjectStorageLanding'),
    'ObjectStorageLanding'
  ),
  getParentRoute: () => objectStorageRoute,
  path: '/',
});

const objectStorageBucketsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/ObjectStorage/BucketLanding/BucketLanding'),
    'BucketLanding'
  ),
  getParentRoute: () => objectStorageIndexRoute,
  path: 'buckets',
});

const objectStorageAccessKeysRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import('src/features/ObjectStorage/AccessKeyLanding/AccessKeyLanding'),
    'AccessKeyLanding'
  ),
  getParentRoute: () => objectStorageIndexRoute,
  path: 'access-keys',
});

const objectStorageBucketDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/ObjectStorage/BucketDetail')
  ),
  getParentRoute: () => objectStorageBucketsRoute,
  path: '$clusterId/$bucketName',
});

export const objectStorageRouteTree = objectStorageRoute.addChildren([
  objectStorageIndexRoute,
  objectStorageBucketsRoute.addChildren([objectStorageBucketDetailRoute]),
  objectStorageAccessKeysRoute,
]);
