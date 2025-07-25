import { createLazyRoute } from '@tanstack/react-router';

import { CreateAlertDefinition } from './CreateAlertDefinition';

export const cloudPulseAlertsCreateLazyRoute = createLazyRoute(
  '/alerts/definitions/create'
)({
  component: CreateAlertDefinition,
});
