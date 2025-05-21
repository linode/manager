import { createLazyRoute } from '@tanstack/react-router';

import { AlertDetail } from 'src/features/CloudPulse/Alerts/AlertsDetail/AlertDetail';
import { AlertListing } from 'src/features/CloudPulse/Alerts/AlertsListing/AlertListing';
import { CreateAlertDefinition } from 'src/features/CloudPulse/Alerts/CreateAlert/CreateAlertDefinition';
import { EditAlertLanding } from 'src/features/CloudPulse/Alerts/EditAlert/EditAlertLanding';

export const cloudPulseAlertsLandingLazyRoute = createLazyRoute(
  '/alerts/definitions'
)({
  component: AlertListing,
});

export const cloudPulseAlertsCreateLazyRoute = createLazyRoute(
  '/alerts/definitions/create'
)({
  component: CreateAlertDefinition,
});

export const cloudPulseAlertsDefinitionsDetailLazyRoute = createLazyRoute(
  '/alerts/definitions/detail/$serviceType/$alertId'
)({
  component: AlertDetail,
});

export const cloudPulseAlertsDefinitionsEditLazyRoute = createLazyRoute(
  '/alerts/definitions/edit/$serviceType/$alertId'
)({
  component: EditAlertLanding,
});
