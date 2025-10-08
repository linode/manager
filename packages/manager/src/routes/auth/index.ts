import { createRoute } from '@tanstack/react-router';

import { CancelLanding } from 'src/features/CancelLanding/CancelLanding';
import { Logout } from 'src/OAuth/Logout';

import { rootRoute } from '../root';

interface CancelLandingSearch {
  survey_link?: string;
}

const cancelLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cancel',
  component: CancelLanding,
  validateSearch: (search: CancelLandingSearch) => search,
});

const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'logout',
  component: Logout,
});

export { cancelLandingRoute, logoutRoute };
