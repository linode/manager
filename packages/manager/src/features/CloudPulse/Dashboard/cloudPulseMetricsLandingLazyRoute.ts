import { createLazyRoute } from '@tanstack/react-router';

import { CloudPulseDashboardLandingWithProvider } from './CloudPulseDashboardLandingWithProvider';

export const cloudPulseMetricsLandingLazyRoute = createLazyRoute('/metrics')({
  component: CloudPulseDashboardLandingWithProvider,
});
