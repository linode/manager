import { createLazyRoute } from '@tanstack/react-router';

import { DefaultsLanding } from './DefaultsLanding';

export const defaultsLandingLazyRoute = createLazyRoute('/iam/roles/')({
  component: DefaultsLanding,
});
