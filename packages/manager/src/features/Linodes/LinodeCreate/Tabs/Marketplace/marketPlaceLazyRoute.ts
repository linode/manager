import { createLazyRoute } from '@tanstack/react-router';

import { Marketplace } from './Marketplace';

export const marketPlaceLazyRoute = createLazyRoute(
  '/linodes/create/marketplace'
)({
  component: Marketplace,
});
