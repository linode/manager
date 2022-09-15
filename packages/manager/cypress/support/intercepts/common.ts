/**
 * @file Mocks and intercepts for common and/or frequent API requests.
 */

import { accountFactory } from 'src/factories/account';

/**
 * Options for mocking common Linode APIv4 requests.
 */
export interface CommonRequestMockOptions {
  /**
   * Whether or not the `/account` API request should be mocked.
   *
   * @var {boolean}
   */
  account?: boolean;
}

/**
 * Mocks common API requests that Cloud Manager makes on each page load.
 *
 * While the mocked results themselves cannot be modified, an optional
 * `CommonRequestMockOptions` object can be used to disable or enable mocks
 * for individual API requests.
 *
 * @param options - Options to determine which API requests should be mocked. Optional.
 */
export const mockCommonRequests = (
  options?: CommonRequestMockOptions | undefined
) => {
  // Default mock options
  const defaultOptions: CommonRequestMockOptions = {
    account: true,
  };

  const resolvedOptions = options
    ? {
        ...defaultOptions,
        ...options,
      }
    : defaultOptions;

  const aliases: string[] = [];

  if (resolvedOptions.account) {
    const mockedAccount = accountFactory.build();
    cy.intercept('GET', `*/account`, mockedAccount).as('getAccount');
    aliases.push('@getAccount');
  }

  return aliases;
};
