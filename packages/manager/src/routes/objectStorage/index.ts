import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ObjectStorageRoute } from './ObjectStorageRoute';

export interface ObjectStorageDetailSearchParams {
  prefix?: string;
}

export const objectStorageRoute = createRoute({
  component: ObjectStorageRoute,
  getParentRoute: () => rootRoute,
  path: 'object-storage',
});

const objectStorageIndexRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/object-storage/buckets' });
  },
  getParentRoute: () => objectStorageRoute,
  path: '/',
}).lazy(() =>
  import('src/features/ObjectStorage/objectStorageLandingLazyRoute').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketsLandingRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets',
}).lazy(() =>
  import('src/features/ObjectStorage/objectStorageLandingLazyRoute').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeysLandingRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys',
}).lazy(() =>
  import('src/features/ObjectStorage/objectStorageLandingLazyRoute').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketCreateRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets/create',
}).lazy(() =>
  import('src/features/ObjectStorage/objectStorageLandingLazyRoute').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeyCreateRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys/create',
}).lazy(() =>
  import('src/features/ObjectStorage/objectStorageLandingLazyRoute').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketDetailRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets/$clusterId/$bucketName',
  validateSearch: (search: ObjectStorageDetailSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/ObjectStorage/BucketDetail/bucketDetailLandingLazyRoute'
  ).then((m) => m.bucketDetailLandingLazyRoute)
);

const objectStorageBucketDetailObjectsRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'objects',
}).lazy(() =>
  import(
    'src/features/ObjectStorage/BucketDetail/bucketDetailLandingLazyRoute'
  ).then((m) => m.bucketDetailLandingLazyRoute)
);

const objectStorageBucketDetailAccessRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'access',
}).lazy(() =>
  import(
    'src/features/ObjectStorage/BucketDetail/bucketDetailLandingLazyRoute'
  ).then((m) => m.bucketDetailLandingLazyRoute)
);

const objectStorageBucketMetricsRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'metrics',
}).lazy(() =>
  import(
    'src/features/ObjectStorage/BucketDetail/bucketDetailLandingLazyRoute'
  ).then((m) => m.bucketDetailLandingLazyRoute)
);

const objectStorageBucketSSLRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'ssl',
}).lazy(() =>
  import(
    'src/features/ObjectStorage/BucketDetail/bucketDetailLandingLazyRoute'
  ).then((m) => m.bucketDetailLandingLazyRoute)
);
export const objectStorageRouteTree = objectStorageRoute.addChildren([
  objectStorageIndexRoute.addChildren([
    objectStorageBucketCreateRoute,
    objectStorageAccessKeyCreateRoute,
    objectStorageBucketsLandingRoute,
    objectStorageAccessKeysLandingRoute,
  ]),
  objectStorageBucketDetailRoute.addChildren([
    objectStorageBucketDetailObjectsRoute,
    objectStorageBucketDetailAccessRoute,
    objectStorageBucketSSLRoute,
    objectStorageBucketMetricsRoute,
  ]),
]);
