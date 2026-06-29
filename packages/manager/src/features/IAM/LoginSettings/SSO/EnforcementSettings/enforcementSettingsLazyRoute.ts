import { createLazyRoute } from '@tanstack/react-router';

import { EnforcementSettingsLanding } from './EnforcementSettingsLanding';

export const enforcementSettingsLazyRoute = createLazyRoute(
  '/iam/settings/sso/enforcement-settings'
)({
  component: EnforcementSettingsLanding,
});
