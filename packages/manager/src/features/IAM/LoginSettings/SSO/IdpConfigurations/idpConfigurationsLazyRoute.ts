import { createLazyRoute } from '@tanstack/react-router';

import { IdpConfigurationsLanding } from './IdpConfigurationsLanding';

export const idpConfigurationsLazyRoute = createLazyRoute(
  '/iam/settings/sso/idp-configurations'
)({
  component: IdpConfigurationsLanding,
});
