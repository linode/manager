import { createLazyRoute } from '@tanstack/react-router';

import { ProductDetails } from './ProductDetails';

export const productDetailsLazyRoute = createLazyRoute(
  '/cloud-marketplace/catalog/$productId'
)({
  component: ProductDetails,
});
