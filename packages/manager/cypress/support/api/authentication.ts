/**
 * @file Functions and utilities to assist with Linode API v4 authentication.
 */
import { oauthToken } from 'support/constants/api';
import { configureLinodeApi } from 'support/util/api';

/**
 * Intercepts and configures Linode API-v4 requests initiated during Cypress during tests.
 *
 * Applies an authorization header using the personal access token exposed to
 * Cypress via the `MANAGER_OAUTH` environment variable. Additionally, if
 * the `REACT_APP_API_ROOT` environment variable is specified, it is also
 * applied as the base URL for requests.
 *
 * This function must be executed in each Cypress spec file that intends to
 * communicate with the API directly.
 *
 * This is useful when setting up data for tests, but is not necessary for the
 * Cloud Manager app itself to function within Cypress.
 */
export const authenticate = () => {
  const baseUrl = Cypress.env('REACT_APP_API_ROOT');
  configureLinodeApi(oauthToken, baseUrl);
};
