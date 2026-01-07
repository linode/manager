import { createLazyRoute } from '@tanstack/react-router';

import { MarketplaceLanding } from './MarketplaceLanding';

export const marketplaceLazyRoute = createLazyRoute(
  '/cloud-marketplace/catalog'
)({
  component: MarketplaceLanding,
});
