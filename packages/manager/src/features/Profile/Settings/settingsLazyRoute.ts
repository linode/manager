import { createLazyRoute } from '@tanstack/react-router';

import { ProfileSettings } from './Settings';

export const preferencesLazyRoute = createLazyRoute('/profile/preferences')({
  component: ProfileSettings,
});
