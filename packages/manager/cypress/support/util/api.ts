/**
 * @file Utilities to help configure @linode/api-v4 package.
 */

import { baseRequest } from '@linode/api-v4';

// Note: This file is imported by Cypress plugins, and indirectly by Cypress
// tests. Because Cypress has not been initiated when plugins are executed, we
// cannot use any Cypress functionality in this module without causing a crash
// at startup.

/**
 * Default API root URL to use for replacement logic when using a URL override.
 *
 * This value is copied from the @linode/api-v4 package.
 *
 * @link https://github.com/linode/manager/blob/develop/packages/api-v4/src/request.ts
 */
export const defaultApiRoot = 'https://api.linode.com/v4';

/**
 * Configures and authenticates Linode API requests initiated by Cypress.
 *
 * @param accessToken - API access token with which to authenticate requests.
 * @param baseUrl - Optional Linode API base URL.
 */
export const configureLinodeApi = (accessToken: string, baseUrl?: string) => {
  baseRequest.interceptors.request.use((config) => {
    // If a base URL is provided, override the request URL
    // using the given base URL. Otherwise, evaluate to an empty object so
    // we can still use the spread operator later on.
    const url = config.url;
    const urlOverride =
      !baseUrl || !url ? {} : { url: url.replace(defaultApiRoot, baseUrl) };

    return {
      ...config,
      headers: {
        ...config.headers,
        common: {
          ...config.headers.common,
          authorization: `Bearer ${accessToken}`,
        },
      },
      ...urlOverride,
    };
  });
};
