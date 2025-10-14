import { createLazyRoute } from '@tanstack/react-router';

import { LoginHistoryLanding } from './LoginHistoryLanding';

export const loginHistoryLandingLazyRoute = createLazyRoute('/login-history')({
  component: LoginHistoryLanding,
});
