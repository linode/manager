import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { InferencePlatformRoute } from './InferencePlatformRoute';

const inferencePlatformRoute = createRoute({
  component: InferencePlatformRoute,
  getParentRoute: () => rootRoute,
  path: 'inference-platform',
});

const inferencePlatformIndexRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/inference-platform/inference-hub' });
  },
  getParentRoute: () => inferencePlatformRoute,
  path: '/',
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

const inferencePlatformInferenceHubRoute = createRoute({
  getParentRoute: () => inferencePlatformRoute,
  path: 'inference-hub',
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

export interface ModelPlaygroundSearch {
  model?: string;
}

const inferencePlatformModelPlaygroundRoute = createRoute({
  getParentRoute: () => inferencePlatformRoute,
  path: 'model-playground',
  validateSearch: (search: ModelPlaygroundSearch) => search,
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

const inferencePlatformApiKeyManagementRoute = createRoute({
  getParentRoute: () => inferencePlatformRoute,
  path: 'api-key-management',
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

const inferencePlatformModelLibraryRoute = createRoute({
  getParentRoute: () => inferencePlatformRoute,
  path: 'model-library',
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

const inferencePlatformUsageRoute = createRoute({
  getParentRoute: () => inferencePlatformRoute,
  path: 'usage',
}).lazy(() =>
  import('src/features/InferencePlatform/inferencePlatformLazyRoute').then(
    (m) => m.inferencePlatformLazyRoute
  )
);

export const inferencePlatformRouteTree = inferencePlatformRoute.addChildren([
  inferencePlatformIndexRoute,
  inferencePlatformInferenceHubRoute,
  inferencePlatformModelPlaygroundRoute,
  inferencePlatformApiKeyManagementRoute,
  inferencePlatformModelLibraryRoute,
  inferencePlatformUsageRoute,
]);
