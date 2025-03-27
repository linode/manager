import { createRoute } from '@tanstack/react-router';

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
  getParentRoute: () => objectStorageRoute,
  path: '/',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketsLandingRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeysLandingRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketCreateRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets/create',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeyCreateRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys/create',
}).lazy(() =>
  import('./objectStorageLazyRoutes').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketDetailRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets/$clusterId/$bucketName',
  validateSearch: (search: ObjectStorageDetailSearchParams) => search,
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
  objectStorageIndexRoute.addChildren([
    objectStorageBucketCreateRoute,
    objectStorageAccessKeyCreateRoute,
    objectStorageBucketsLandingRoute,
    objectStorageAccessKeysLandingRoute
  ]),
  objectStorageBucketDetailRoute.addChildren([
    objectStorageBucketDetailObjectsRoute,
    objectStorageBucketDetailAccessRoute,
    objectStorageBucketSSLRoute,
  ]),
]);
