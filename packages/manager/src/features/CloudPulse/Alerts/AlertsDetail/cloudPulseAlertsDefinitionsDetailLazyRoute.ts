import { createLazyRoute } from '@tanstack/react-router';

import { AlertDetail } from './AlertDetail';

export const cloudPulseAlertsDefinitionsDetailLazyRoute = createLazyRoute(
  '/alerts/definitions/detail/$serviceType/$alertId'
)({
  component: AlertDetail,
});
