import { createRoute } from '@tanstack/react-router';

import { CancelLanding } from 'src/features/CancelLanding/CancelLanding';
import { Logout } from 'src/OAuth/Logout';
import { OAuthCallback } from 'src/OAuth/OAuthCallback';

import { rootRoute } from '../root';

const cancelLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cancel',
  component: CancelLanding,
});

const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'logout',
  component: Logout,
});

const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'oauth/callback',
  component: OAuthCallback,
});

export { cancelLandingRoute, logoutRoute, oauthCallbackRoute };
