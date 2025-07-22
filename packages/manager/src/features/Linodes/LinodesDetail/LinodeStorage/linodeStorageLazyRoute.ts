import { createLazyRoute } from '@tanstack/react-router';

import { LinodeStorage } from './LinodeStorage';

export const linodeStorageLazyRoute = createLazyRoute(
  '/linodes/$linodeId/storage'
)({
  component: LinodeStorage,
});
