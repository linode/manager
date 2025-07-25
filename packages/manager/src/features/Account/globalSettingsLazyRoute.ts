import { createLazyRoute } from '@tanstack/react-router';

import GlobalSettings from './GlobalSettings';

export const globalSettingsLazyRoute = createLazyRoute('/account/settings')({
  component: GlobalSettings,
});
