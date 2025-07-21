import { createLazyRoute } from '@tanstack/react-router';

import { ProfileSettings } from './Settings';

export const settingsLazyRoute = createLazyRoute('/profile/settings')({
  component: ProfileSettings,
});
