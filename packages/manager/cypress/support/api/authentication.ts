/**
 * @file Functions and utilities to assist with Linode API v4 authentication.
 */

import { baseRequest } from '@linode/api-v4/lib/request';
import { oauthToken } from 'support/constants/api';

const getApiRequestUrl = (baseUrl, originalRequestUrl) => {
  const defaultApiRoot = 'https://api.linode.com/v4';
  const apiRoot = Cypress.env('REACT_APP_API_ROOT') || defaultApiRoot;

  return originalRequestUrl.replace(baseUrl, apiRoot);
};

/**
 * Intercepts all Linode API v4 requests and applies an authorization header.
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
      url: getApiRequestUrl(config.baseURL, config.url),
    };
  });
};
