import { createLazyRoute } from '@tanstack/react-router';

import { SettingsLanding } from './SettingsLanding';

export const settingsLandingLazyRoute = createLazyRoute('/settings')({
  component: SettingsLanding,
});
