/**
 * @file Functions and utilities to assist with Linode API v4 authentication.
 */

import { baseRequest } from '@linode/api-v4/lib/request';
import { oauthToken } from 'support/constants/api';

const defaultApiRoot = 'https://api.linode.com/v4';

/**
 * Returns an object containing an overridden API request URL.
 *
 * If no request URL or base override URL is passed, an empty object is returned.
 *
 * @param requestUrl - API request URL.
 *
 * @returns API request URL override object.
 */
const getApiRequestUrlOverride = (requestUrl?: string) => {
  const baseUrl = Cypress.env('REACT_APP_API_ROOT');

  // Short-circuit and return an empty object if no base URL is passed.
  if (!baseUrl || !requestUrl) {
    return {};
  }
  const overriddenUrl = requestUrl.replace(defaultApiRoot, baseUrl);
  return {
    url: overriddenUrl,
  };
};

/**
 * Intercepts all Linode API v4 requests and applies an authorization header.
 *
 * Optionally overrides the request URL to correspond with the 'REACT_APP_API_ROOT'
 * environment variable.
 *
 * This function must be executed in each Cypress spec file that intends to
 * communicate with the API directly.
 *
 * This is useful when setting up data for tests, but is not necessary for the
 * Cloud Manager app itself to function within Cypress.
 */
export const authenticate = function () {
  baseRequest.interceptors.request.use(function (config) {
    return {
      ...config,
      headers: {
        ...config.headers,
        common: {
          ...config.headers.common,
          authorization: `Bearer ${oauthToken}`,
        },
      },
      ...getApiRequestUrlOverride(config.url),
    };
  });
};
