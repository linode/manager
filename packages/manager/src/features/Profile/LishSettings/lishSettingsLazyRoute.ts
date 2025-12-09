import { createLazyRoute } from '@tanstack/react-router';

import { LishSettings } from './LishSettings';

export const lishSettingsLazyRoute = createLazyRoute('/profile/lish')({
  component: LishSettings,
});
