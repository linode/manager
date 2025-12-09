import { createLazyRoute } from '@tanstack/react-router';

import { AlertListing } from './AlertListing';

export const cloudPulseAlertsLandingLazyRoute = createLazyRoute(
  '/alerts/definitions'
)({
  component: AlertListing,
});
