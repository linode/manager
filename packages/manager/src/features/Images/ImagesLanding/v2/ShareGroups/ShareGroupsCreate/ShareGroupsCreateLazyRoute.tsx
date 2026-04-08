import { createLazyRoute } from '@tanstack/react-router';

import { ShareGroupsCreateContainer } from './ShareGroupsCreateContainer';

export const shareGroupsCreateLazyRoute = createLazyRoute(
  '/images/share-groups/create'
)({
  component: ShareGroupsCreateContainer,
});
