import { createLazyRoute } from '@tanstack/react-router';

import { CloneLanding } from './CloneLanding';

export const cloneLandingLazyRoute = createLazyRoute(
  '/linodes/$linodeId/clone'
)({
  component: CloneLanding,
});
