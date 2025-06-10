import { createLazyRoute } from '@tanstack/react-router';

import { AccountLanding } from 'src/features/Account/AccountLanding';
import { UserDetail } from 'src/features/Users/UserDetail';

export const accountLandingLazyRoute = createLazyRoute('/account')({
  component: AccountLanding,
});

export const userDetailLazyRoute = createLazyRoute('/account/users/$username')({
  component: UserDetail,
});
