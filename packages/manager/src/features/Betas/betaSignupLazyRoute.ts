import { createLazyRoute } from '@tanstack/react-router';

import { BetaSignup } from './BetaSignup';

export const betaSignupLazyRoute = createLazyRoute('/betas/signup/$betaId')({
  component: BetaSignup,
});
