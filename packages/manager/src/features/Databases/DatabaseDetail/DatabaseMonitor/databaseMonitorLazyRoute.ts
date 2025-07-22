import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseMonitor } from './DatabaseMonitor';

export const databaseMonitorLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/metrics'
)({
  component: DatabaseMonitor,
});
