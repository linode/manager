import { createLazyRoute } from '@tanstack/react-router';

import { BillingLanding } from './BillingLanding';

export const billingLandingLazyRoute = createLazyRoute('/billing')({
  component: BillingLanding,
});
