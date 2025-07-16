import { createLazyRoute } from '@tanstack/react-router';

import { PlacementGroupsLanding } from 'src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLanding';

export const placementGroupsLandingLazyRoute = createLazyRoute(
  '/placement-groups'
)({
  component: PlacementGroupsLanding,
});
