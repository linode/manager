/**
 * @file Util functions and mock data related to Linode Managed.
 */

import { mockGetAccountSettings } from 'support/intercepts/account';
import { skip } from 'support/util/skip';

import { accountSettingsFactory } from 'src/factories/accountSettings';

import type { AccountSettings } from '@linode/api-v4';

// / Account object with Managed enabled for mocking API requests.
export const managedAccount = accountSettingsFactory.build({
  managed: true,
});

// / Account object without Managed enabled for mocking API requests.
export const nonManagedAccount = accountSettingsFactory.build({
  managed: false,
});

/**
 * Skips the test if Linode Managed is enabled on the test account.
 *
 * Certain tests only function correctly if Managed is disabled, and this function
 * can be used to skip such tests when Managed is enabled.
 *
 * Optionally, if the `CY_TEST_FAIL_ON_MANAGED` environment variable is defined,
 * the test will fail rather than being skipped. This is useful in environments
 * where Managed is not expected to be enabled (e.g. when being run via CI).
 */
export const expectManagedDisabled = () => {
  const accountSettings = Cypress.env('cloudManagerAccountSettings') as
    | AccountSettings
    | undefined;
  const failOnManaged = Cypress.env('CY_TEST_FAIL_ON_MANAGED');

  if (!accountSettings) {
    throw new Error('Unable to retrieve cached account settings');
  }

  if (accountSettings.managed) {
    if (failOnManaged) {
      throw new Error(
        'Test failed because Managed is enabled on the test account. This test expects Managed to be disabled.'
      );
    }
    cy.log('Skipping test because Managed is enabled on test account');
    skip();
  }
};

/**
 * Visits the given Manager URL with account settings mocked to enable Managed.
 *
 * @param url - URL to visit.
 */
export const visitUrlWithManagedEnabled = (url: string) => {
  mockGetAccountSettings(managedAccount).as('getAccountSettings');
  cy.visitWithLogin(url);
  cy.wait('@getAccountSettings');
};

/**
 * Visits the given Manager URL with account settings mocked to disable Managed.
 *
 * @param url - URL to visit.
 */
export const visitUrlWithManagedDisabled = (url: string) => {
  mockGetAccountSettings(nonManagedAccount).as('getAccountSettings');
  cy.visitWithLogin(url);
  cy.wait('@getAccountSettings');
};
