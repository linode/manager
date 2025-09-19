import { createLazyRoute } from '@tanstack/react-router';

import { MaintenanceLanding } from './MaintenanceLanding';

export const maintenanceLandingLandingLazyRoute = createLazyRoute(
  '/maintenance'
)({
  component: MaintenanceLanding,
});
