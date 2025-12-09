import { mockGetAccount } from 'support/intercepts/account';

/**
 * @file Mocks Linode APIv4 account request to improve performance.
 */
import type { Account } from '@linode/api-v4';

/**
 * Mocks the Linode API account info GET request to improve performance.
 *
 * If cached account data is not available, no mocking occurs. Mocks can be
 * overridden on a case-by-case basis by using the `mockGetAccount` utility
 * within tests.
 */
export const mockAccountRequest = () => {
  // `cloudManagerAccount` is fetched during setup if the `fetchAccount` plugin is used.
  // See also: `cypress/support/plugins/fetch-account.ts`.
  const cachedAccount = Cypress.env('cloudManagerAccount') as
    | Account
    | undefined;

  // Short-circuit with a warning if no cached account data is available.
  if (!cachedAccount) {
    console.warn(
      'Cached Linode account data is not present. Performance may be impacted.'
    );
    return;
  }

  beforeEach(() => {
    mockGetAccount(cachedAccount);
  });
};
