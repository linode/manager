import { createLazyRoute } from '@tanstack/react-router';

import { AuthenticationSettings } from './AuthenticationSettings';

export const authenticationSettingsLazyRoute = createLazyRoute('/profile/auth')(
  {
    component: AuthenticationSettings,
  }
);
