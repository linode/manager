import { createRoute } from '@tanstack/react-router';

import { CancelLanding } from 'src/features/CancelLanding/CancelLanding';
import { LoginAsCustomerCallback } from 'src/OAuth/LoginAsCustomerCallback';
import { Logout } from 'src/OAuth/Logout';
import { OAuthCallback } from 'src/OAuth/OAuthCallback';

import { rootRoute } from '../root';

interface OAuthCallbackSearch {
  code?: string;
  returnTo?: string;
  state?: string;
}

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

const loginAsCustomerCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/callback',
  component: LoginAsCustomerCallback,
});

const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'oauth/callback',
  component: OAuthCallback,
  validateSearch: (search: OAuthCallbackSearch) => search,
});

export {
  cancelLandingRoute,
  loginAsCustomerCallbackRoute,
  logoutRoute,
  oauthCallbackRoute,
};
