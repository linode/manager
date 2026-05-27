import { createLazyRoute } from '@tanstack/react-router';

import { ShareGroupDetails } from './ShareGroupDetails';

export const shareGroupDetailsLazyRoute = createLazyRoute(
  '/images/share-groups/owned-groups/$shareGroupId'
)({
  component: ShareGroupDetails,
});
