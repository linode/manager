import { createLazyRoute } from '@tanstack/react-router';

import { TfaEnforcementLanding } from './TfaEnforcementLanding';

export const tfaEnforcementLandingLazyRoute = createLazyRoute(
  '/iam/settings/tfa-enforcement'
)({
  component: TfaEnforcementLanding,
});
