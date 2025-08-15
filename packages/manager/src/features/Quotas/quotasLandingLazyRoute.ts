import { createLazyRoute } from '@tanstack/react-router';

import { QuotasLanding } from './QuotasLanding';

export const quotasLandingLazyRoute = createLazyRoute('/quotas')({
  component: QuotasLanding,
});
