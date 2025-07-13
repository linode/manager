import { createLazyRoute } from '@tanstack/react-router';

import MaintenanceLanding from './MaintenanceLanding';

export const maintenanceLandingLazyRoute = createLazyRoute(
  '/account/maintenance'
)({
  component: MaintenanceLanding,
});
