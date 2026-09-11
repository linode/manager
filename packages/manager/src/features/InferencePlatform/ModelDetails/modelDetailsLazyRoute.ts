import { createLazyRoute } from '@tanstack/react-router';

import { ModelDetails } from './ModelDetails';

export const modelDetailsLazyRoute = createLazyRoute(
  '/inference-platform/model-library/$modelId'
)({
  component: ModelDetails,
});
