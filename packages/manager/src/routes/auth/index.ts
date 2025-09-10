import { createRoute } from '@tanstack/react-router';

import { CancelLanding } from 'src/features/CancelLanding/CancelLanding';
import { LoginAsCustomerCallback } from 'src/OAuth/LoginAsCustomerCallback';
import { Logout } from 'src/OAuth/Logout';
import { OAuthCallback } from 'src/OAuth/OAuthCallback';

import { mainContentRoute } from '../mainContent';
import { rootRoute } from '../root';

interface CancelLandingSearch {
  survey_link?: string;
}

const cancelLandingRoute = createRoute({
  getParentRoute: () => mainContentRoute,
  path: 'cancel',
  component: CancelLanding,
  validateSearch: (search: CancelLandingSearch) => search,
});

const logoutRoute = createRoute({
  getParentRoute: () => mainContentRoute,
  path: 'logout',
  component: Logout,
});

const loginAsCustomerCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/callback',
  component: LoginAsCustomerCallback,
});

const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'oauth/callback',
  component: OAuthCallback,
});

export {
  cancelLandingRoute,
  loginAsCustomerCallbackRoute,
  logoutRoute,
  oauthCallbackRoute,
};
