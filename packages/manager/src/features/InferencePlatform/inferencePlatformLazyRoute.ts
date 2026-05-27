import { createLazyRoute } from '@tanstack/react-router';

import { InferencePlatform } from './InferencePlatform';

export const inferencePlatformLazyRoute = createLazyRoute(
  '/inference-platform'
)({
  component: InferencePlatform,
});
