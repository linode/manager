import { createLazyRoute } from '@tanstack/react-router';

import { CloneAlertLanding } from 'src/features/CloudPulse/Alerts/CloneAlert/CloneAlertLanding';

export const cloudPulseAlertsDefinitionsCloneLazyRoute = createLazyRoute(
  '/alerts/definitions/clone/$serviceType/$originalAlertId'
)({
  component: CloneAlertLanding,
});
