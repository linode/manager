import { createLazyRoute } from '@tanstack/react-router';

import { EditAlertLanding } from 'src/features/CloudPulse/Alerts/EditAlert/EditAlertLanding';

export const cloudPulseAlertsDefinitionsEditLazyRoute = createLazyRoute(
  '/alerts/definitions/edit/$serviceType/$alertId'
)({
  component: EditAlertLanding,
});
