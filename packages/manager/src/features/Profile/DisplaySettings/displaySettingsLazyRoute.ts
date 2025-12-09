import { createLazyRoute } from '@tanstack/react-router';

import { DisplaySettings } from './DisplaySettings';

export const displaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
