/**
 * @file Integration tests for Cloud Manager account login history flows.
 */

import { accountFactory, profileFactory } from 'src/factories';
import { accountLoginFactory } from 'src/factories/accountLogin';
import {
  mockGetAccount,
  mockGetAccountLogins,
} from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';

describe('Account login history', () => {
  /*
   * - Confirms that a user can navigate to and view the login history page.
   * - Confirms that login table displays the expected columns.
   * - Confirms that the login table displays mocked failed and successful logins.
   */
  it.only('users can view the login history table', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-user',
      restricted: false,
      user_type: null,
    });
    const mockFailedLogin = accountLoginFactory.build({ status: 'failed' });
    const mockSuccessfulLogin = accountLoginFactory.build({
      status: 'successful',
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccountLogins([mockFailedLogin, mockSuccessfulLogin]).as(
      'getAccountLogins'
    );

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getAccount', '@getProfile', '@getAccountLogins']);

    // Confirm helper text above table is visible.
    cy.findByText(
      'Logins across all users on your account over the last 90 days.'
    ).should('be.visible');

    // Confirm the mocked logins are visible in table.
    // TODO
  });

  it('child users cannot view login history and see a warning', () => {});

  it('restricted users without `read_write` account_access cannot view login history and see a warning', () => {});
});
