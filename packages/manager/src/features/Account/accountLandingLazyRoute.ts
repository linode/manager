import { createLazyRoute } from '@tanstack/react-router';

import { AccountLanding } from 'src/features/Account/AccountLanding';

export const accountLandingLazyRoute = createLazyRoute('/account')({
  component: AccountLanding,
});
