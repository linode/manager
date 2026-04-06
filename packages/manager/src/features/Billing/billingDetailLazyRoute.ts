import { createLazyRoute } from '@tanstack/react-router';

import { BillingDetail } from './BillingDetail';

export const billingDetailLazyRoute = createLazyRoute('/account/billing')({
  component: BillingDetail,
});
