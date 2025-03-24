import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ObjectStorageRoute } from './ObjectStorageRoute';

export const objectStorageRoute = createRoute({
  component: ObjectStorageRoute,
  getParentRoute: () => rootRoute,
  path: 'object-storage',
});

const objectStorageIndexRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: '/',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketsRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeysRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketCreateRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: 'create',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeyCreateRoute = createRoute({
  getParentRoute: () => objectStorageAccessKeysRoute,
  path: 'create',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketDetailRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: '$clusterId/$bucketName',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketDetailObjectsRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'objects',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketDetailAccessRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'access',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketSSLRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'ssl',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);
export const objectStorageRouteTree = objectStorageRoute.addChildren([
  objectStorageIndexRoute,
  objectStorageBucketsRoute.addChildren([
    objectStorageBucketDetailRoute.addChildren([
      objectStorageBucketDetailObjectsRoute,
      objectStorageBucketDetailAccessRoute,
      objectStorageBucketSSLRoute,
    ]),
    objectStorageBucketCreateRoute,
    objectStorageAccessKeyCreateRoute,
  ]),
  objectStorageAccessKeysRoute,
]);
