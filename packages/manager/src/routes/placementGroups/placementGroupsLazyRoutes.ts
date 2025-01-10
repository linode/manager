import { createLazyRoute } from '@tanstack/react-router';

import { PlacementGroupsDetail } from 'src/features/PlacementGroups/PlacementGroupsDetail/PlacementGroupsDetail';
import { PlacementGroupsLanding } from 'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding';

export const placementGroupsDetailLazyRoute = createLazyRoute(
  '/placement-groups/$id'
)({
  component: PlacementGroupsDetail,
});

export const placementGroupsLandingLazyRoute = createLazyRoute(
  '/placement-groups'
)({
  component: PlacementGroupsLanding,
});
