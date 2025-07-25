import { createLazyRoute } from '@tanstack/react-router';

import LinodeAlerts from './LinodeAlerts';

export const linodeAlertsLazyRoute = createLazyRoute(
  '/linodes/$linodeId/alerts'
)({
  component: LinodeAlerts,
});
