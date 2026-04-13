import { createLazyRoute } from '@tanstack/react-router';

import { ServerlessInference } from './ServerlessInference';

export const serverlessInferenceLazyRoute = createLazyRoute(
  '/serverless-inference'
)({
  component: ServerlessInference,
});
