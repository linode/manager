import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseAlerts } from './DatabaseAlerts';

export const databaseAlertsLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/alerts'
)({
  component: DatabaseAlerts,
});
