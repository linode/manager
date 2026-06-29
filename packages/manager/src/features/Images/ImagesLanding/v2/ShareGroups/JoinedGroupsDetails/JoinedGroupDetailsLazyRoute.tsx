import { createLazyRoute } from '@tanstack/react-router';

import { JoinedGroupDetails } from './JoinedGroupDetails';

export const joinedGroupDetailsLazyRoute = createLazyRoute(
  '/images/share-groups/joined-groups/$tokenUuid'
)({
  component: JoinedGroupDetails,
});
