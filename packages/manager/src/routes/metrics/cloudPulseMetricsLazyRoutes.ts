import { createLazyRoute } from '@tanstack/react-router';

import { CloudPulseDashboardLanding } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardLanding';

export const cloudPulseMetricsLandingLazyRoute = createLazyRoute('/metrics')({
  component: CloudPulseDashboardLanding,
});
