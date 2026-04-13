import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ServerlessInferenceRoute } from './ServerlessInferenceRoute';

const serverlessInferenceRoute = createRoute({
  component: ServerlessInferenceRoute,
  getParentRoute: () => rootRoute,
  path: 'serverless-inference',
});

const serverlessInferenceIndexRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/serverless-inference/inference-hub' });
  },
  getParentRoute: () => serverlessInferenceRoute,
  path: '/',
}).lazy(() =>
  import('src/features/ServerlessInference/serverlessInferenceLazyRoute').then(
    (m) => m.serverlessInferenceLazyRoute
  )
);

const serverlessInferenceInferenceHubRoute = createRoute({
  getParentRoute: () => serverlessInferenceRoute,
  path: 'inference-hub',
}).lazy(() =>
  import('src/features/ServerlessInference/serverlessInferenceLazyRoute').then(
    (m) => m.serverlessInferenceLazyRoute
  )
);

const serverlessInferenceModelPlaygroundRoute = createRoute({
  getParentRoute: () => serverlessInferenceRoute,
  path: 'model-playground',
}).lazy(() =>
  import('src/features/ServerlessInference/serverlessInferenceLazyRoute').then(
    (m) => m.serverlessInferenceLazyRoute
  )
);

const serverlessInferenceApiKeyManagementRoute = createRoute({
  getParentRoute: () => serverlessInferenceRoute,
  path: 'api-key-management',
}).lazy(() =>
  import('src/features/ServerlessInference/serverlessInferenceLazyRoute').then(
    (m) => m.serverlessInferenceLazyRoute
  )
);

const serverlessInferenceModelLibraryRoute = createRoute({
  getParentRoute: () => serverlessInferenceRoute,
  path: 'model-library',
}).lazy(() =>
  import('src/features/ServerlessInference/serverlessInferenceLazyRoute').then(
    (m) => m.serverlessInferenceLazyRoute
  )
);

export const serverlessInferenceRouteTree =
  serverlessInferenceRoute.addChildren([
    serverlessInferenceIndexRoute,
    serverlessInferenceInferenceHubRoute,
    serverlessInferenceModelPlaygroundRoute,
    serverlessInferenceApiKeyManagementRoute,
    serverlessInferenceModelLibraryRoute,
  ]);
