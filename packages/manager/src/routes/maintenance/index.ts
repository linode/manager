import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { MaintenanceRoute } from './MaintenanceRoute';

const maintenanceRoute = createRoute({
  component: MaintenanceRoute,
  getParentRoute: () => rootRoute,
  path: 'maintenance',
});

// Catch all route for maintenance page
const maintenanceCatchAllRoute = createRoute({
  getParentRoute: () => maintenanceRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/maintenance' });
  },
});

// Index route: /maintenance (main maintenance content)
const maintenanceIndexRoute = createRoute({
  getParentRoute: () => maintenanceRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Maintenance/maintenanceLandingLazyRoute').then(
    (m) => m.maintenanceLandingLandingLazyRoute
  )
);

export const maintenanceRouteTree = maintenanceRoute.addChildren([
  maintenanceIndexRoute,
  maintenanceCatchAllRoute,
]);
