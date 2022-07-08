/**
 * @file Mocks and intercepts for common and/or frequent API requests.
 */

import { accountFactory } from 'src/factories/account';

export interface CommonRequestMockOptions {
  account?: boolean;
  agreements?: boolean;
  launchDarkly?: boolean;
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
  const defaultOptions: CommonRequestMockOptions = {
    account: true,
    agreements: true,
    launchDarkly: true,
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

  if (resolvedOptions.launchDarkly) {
    cy.intercept('GET', '*clientstream.launchdarkly.com*', {});
  }

  return aliases;
};
