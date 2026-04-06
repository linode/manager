import { createLazyRoute } from '@tanstack/react-router';

import LinodeConfigs from './LinodeConfigs';

export const linodeConfigsLazyRoute = createLazyRoute(
  '/linodes/$linodeId/configurations'
)({
  component: LinodeConfigs,
});
