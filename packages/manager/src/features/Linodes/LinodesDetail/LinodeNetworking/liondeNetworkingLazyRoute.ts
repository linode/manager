import { createLazyRoute } from '@tanstack/react-router';

import { LinodeNetworking } from './LinodeNetworking';

export const linodeNetworkingLazyRoute = createLazyRoute(
  '/linodes/$linodeId/networking'
)({
  component: LinodeNetworking,
});
