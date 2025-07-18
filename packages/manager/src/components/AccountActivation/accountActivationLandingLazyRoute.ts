import { createLazyRoute } from '@tanstack/react-router';

import { AccountActivationLanding } from 'src/components/AccountActivation/AccountActivationLanding';

export const accountActivationLandingLazyRoute = createLazyRoute(
  '/account-activation'
)({
  component: AccountActivationLanding,
});
