import { createLazyRoute } from '@tanstack/react-router';

import { PlacementGroupsDetail } from 'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail';

export const placementGroupsDetailLazyRoute = createLazyRoute(
  '/placement-groups/$id'
)({
  component: PlacementGroupsDetail,
});
