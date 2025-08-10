import { createLazyRoute } from '@tanstack/react-router';

import { BillingV2 } from './BillingV2';

export const billingDetailLazyRoute = createLazyRoute('/billing')({
  component: BillingV2,
});
