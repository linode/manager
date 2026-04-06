import { createLazyRoute } from '@tanstack/react-router';

import LinodeSettings from './LinodeSettings';

export const linodeSettingsLazyRoute = createLazyRoute(
  '/linodes/$linodeId/settings'
)({
  component: LinodeSettings,
});
