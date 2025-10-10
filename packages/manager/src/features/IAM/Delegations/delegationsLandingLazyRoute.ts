import { createLazyRoute } from '@tanstack/react-router';

import { AccountDelegations } from './AccountDelegations';

export const delegationsLandingLazyRoute = createLazyRoute('/iam/delegations')({
  component: AccountDelegations,
});
