/**
 * @file Util functions and mock data related to Linode Managed.
 */

import { accountSettingsFactory } from 'src/factories/accountSettings';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { mockGetUserPreferences } from 'support/intercepts/profile';

/// Account object with Managed enabled for mocking API requests.
export const managedAccount = accountSettingsFactory.build({
  managed: true,
});

/// Account object without Managed enabled for mocking API requests.
export const nonManagedAccount = accountSettingsFactory.build({
  managed: false,
});

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
  mockGetUserPreferences(nonManagedAccount).as('getAccountSettings');
  cy.visitWithLogin(url);
  cy.wait('@getAccountSettings');
};
