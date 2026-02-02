import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { MarketplaceRoute } from './MarketplaceRoute';

export interface MarketplaceCatalogSearch {
  category?: string;
  query?: string;
  type?: string;
}

export const marketplaceRoute = createRoute({
  component: MarketplaceRoute,
  getParentRoute: () => rootRoute,
  path: 'cloud-marketplace',
});

export const marketplaceLandingRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/cloud-marketplace/catalog' });
  },
  getParentRoute: () => marketplaceRoute,
  path: '/',
});

export const marketplaceCatlogRoute = createRoute({
  getParentRoute: () => marketplaceRoute,
  path: '/catalog',
  validateSearch: (search: MarketplaceCatalogSearch) => search,
}).lazy(() =>
  import(
    'src/features/Marketplace/MarketplaceLanding/marketplaceLazyRoute'
  ).then((m) => m.marketplaceLazyRoute)
);

export const marketplaceProductDetailsRoute = createRoute({
  getParentRoute: () => marketplaceRoute,
  parseParams: (params) => ({
    productId: Number(params.productId),
  }),
  path: '/catalog/$productId',
}).lazy(() =>
  import(
    'src/features/Marketplace/ProductDetails/productDetailsLazyRoute'
  ).then((m) => m.productDetailsLazyRoute)
);

export const marketplaceRouteTree = marketplaceRoute.addChildren([
  marketplaceLandingRoute,
  marketplaceCatlogRoute,
  marketplaceProductDetailsRoute,
]);
