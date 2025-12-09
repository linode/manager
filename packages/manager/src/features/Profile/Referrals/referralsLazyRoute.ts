import { createLazyRoute } from '@tanstack/react-router';

import { Referrals } from './Referrals';

export const referralsLazyRoute = createLazyRoute('/profile/referrals')({
  component: Referrals,
});
