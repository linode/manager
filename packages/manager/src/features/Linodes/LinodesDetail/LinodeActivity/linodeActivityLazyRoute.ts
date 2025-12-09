import { createLazyRoute } from '@tanstack/react-router';

import LinodeActivity from './LinodeActivity';

export const linodeActivityLazyRoute = createLazyRoute(
  '/linodes/$linodeId/activity'
)({
  component: LinodeActivity,
});
