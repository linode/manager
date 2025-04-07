/**
 * @file Integration tests for Cloud Manager account login history flows.
 */

import { profileFactory } from '@linode/utilities';
import {
  loginEmptyStateMessageText,
  loginHelperText,
} from 'support/constants/account';
import { mockGetAccountLogins } from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';

import { accountLoginFactory } from 'src/factories/accountLogin';
import { PARENT_USER } from 'src/features/Account/constants';
import { formatDate } from 'src/utilities/formatDate';

describe('Account login history', () => {
  /*
   * - Confirms that a user can navigate to and view the login history page.
   * - Confirms that login table displays the expected column headers.
   * - Confirms that the login table displays a mocked failed restricted user login.
   * - Confirm that the login table displays a mocked successful unrestricted user login.
   */
  it('users can view the login history table', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'default',
      username: 'mock-user',
    });
    const mockFailedLogin = accountLoginFactory.build({
      restricted: true,
      status: 'failed',
      username: 'mock-restricted-user',
    });
    const mockSuccessfulLogin = accountLoginFactory.build({
      restricted: false,
      status: 'successful',
    });

    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccountLogins([mockFailedLogin, mockSuccessfulLogin]).as(
      'getAccountLogins'
    );

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getProfile']);

    // Confirm helper text above table is visible.
    cy.findByText(loginHelperText).should('be.visible');

    // Confirm the login table includes the expected column headers and mocked logins are visible in table.
    cy.findByLabelText('Account Logins').within(() => {
      cy.get('thead').findByText('Date').should('be.visible');
      cy.get('thead').findByText('Username').should('be.visible');
      cy.get('thead').findByText('IP').should('be.visible');
      cy.get('thead').findByText('Permission Level').should('be.visible');
      cy.get('thead').findByText('Access').should('be.visible');

      // Confirm that restricted user's failed login and status icon display in table.
      cy.findByText(mockFailedLogin.username)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(mockFailedLogin.status, { exact: false }).should(
            'be.visible'
          );
          cy.findAllByLabelText(`Status is ${mockFailedLogin.status}`);
          cy.findByText('Restricted').should('be.visible');
        });

      // Confirm that unrestricted user login displays in table.
      cy.findByText(mockSuccessfulLogin.username)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // Confirm that successful login and status icon display in table.
          cy.findAllByLabelText(`Status is ${mockSuccessfulLogin.status}`);

          // Confirm all other fields display in table.
          cy.findByText(
            formatDate(mockSuccessfulLogin.datetime, {
              timezone: mockProfile.timezone,
            })
          ).should('be.visible');
          cy.findByText(mockSuccessfulLogin.ip).should('be.visible');
          cy.findByText('Unrestricted').should('be.visible');
        });
    });
  });

  /**
   * - Confirms that a child user can navigate to the Login History page.
   * - Confirms that a restricted child user cannot see login history data.
   * - Confirms that a child user sees a notice instead.
   */
  it('restricted child users cannot view login history', () => {
    const mockProfile = profileFactory.build({
      restricted: true,
      user_type: 'child',
      username: 'mock-child-user',
    });

    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getProfile']);

    // Confirm helper text above table and table are not visible.
    cy.findByText(loginHelperText).should('not.exist');
    cy.findByLabelText('Account Logins').should('not.exist');

    cy.findByText(
      `You don't have permissions to edit this Account. Please contact your ${PARENT_USER} to request the necessary permissions.`
    );
  });

  /**
   * - Confirms that a child user can navigate to the Login History page.
   * - Confirms that a unrestricted child user can see login history data.
   */
  it('unrestricted child users can view login history', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'child',
      username: 'mock-child-user',
    });

    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getProfile']);

    // Confirm helper text above table and table are not visible.
    cy.findByText(loginHelperText).should('exist');
    cy.findByLabelText('Account Logins').should('exist');
  });

  /**
   * - Confirms that a restricted user can navigate to the Login History page.
   * - Confirms that a restricted user cannot see login history data.
   * - Confirms that a restricted user sees a notice instead.
   */
  it('restricted users cannot view login history', () => {
    const mockProfile = profileFactory.build({
      restricted: true,
      user_type: 'default',
      username: 'mock-restricted-user',
    });

    mockGetProfile(mockProfile).as('getProfile');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getProfile']);

    // Confirm helper text above table and table are not visible.
    cy.findByText(loginHelperText).should('not.exist');
    cy.findByLabelText('Account Logins').should('not.exist');

    cy.findByText(
      "You don't have permissions to edit this Account. Please contact your account administrator to request the necessary permissions."
    );
  });

  /*
   * - Vaildates login history landing page with mock data.
   * - Confirms that each login is listed in the Login History table.
   * - Confirms that "Successful" indicator is shown for successful login attempts, and the "Failure" indicator is shown for the failed ones.
   * - Confirms that clicking on the username for the login navigates to the expected user page
   */
  it('shows each login in the Login History landing page as expected', () => {
    const mockProfile = profileFactory.build({
      restricted: false,
      user_type: 'default',
      username: 'mock-user',
    });
    const mockFailedLogin = accountLoginFactory.build({
      restricted: false,
      status: 'failed',
      username: 'mock-user-failed',
    });
    const mockSuccessfulLogin = accountLoginFactory.build({
      restricted: false,
      status: 'successful',
      username: 'mock-user-successful',
    });

    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccountLogins([mockFailedLogin, mockSuccessfulLogin]).as(
      'getAccountLogins'
    );

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait(['@getProfile']);

    // Confirm helper text above table is visible.
    cy.findByText(loginHelperText).should('be.visible');

    // Confirm the login table includes the expected column headers and mocked logins are visible in table.
    cy.findByLabelText('Account Logins').within(() => {
      cy.get('thead').findByText('Date').should('be.visible');
      cy.get('thead').findByText('Username').should('be.visible');
      cy.get('thead').findByText('IP').should('be.visible');
      cy.get('thead').findByText('Permission Level').should('be.visible');
      cy.get('thead').findByText('Access').should('be.visible');

      // Confirm that restricted user's failed login and status icon display in table.
      cy.findByText(mockFailedLogin.username)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // cy.findByText(mockFailedLogin.status, { exact: false }).should(
          //   'be.visible'
          // );
          cy.findAllByLabelText(`Status is ${mockFailedLogin.status}`);
          cy.findByText('Unrestricted').should('be.visible');
        });

      // Confirm that unrestricted user login displays in table.
      cy.findByText(mockSuccessfulLogin.username)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // Confirm that successful login and status icon display in table.
          cy.findAllByLabelText(`Status is ${mockSuccessfulLogin.status}`);

          // Confirm all other fields display in table.
          cy.findByText(
            formatDate(mockSuccessfulLogin.datetime, {
              timezone: mockProfile.timezone,
            })
          ).should('be.visible');
          cy.findByText(mockSuccessfulLogin.ip).should('be.visible');
          cy.findByText('Unrestricted').should('be.visible');
        });
    });
  });

  /*
   * - Confirms that empty state is handled gracefully, showing corresponding message.
   */
  it('shows empty message when there is no login history', () => {
    mockGetAccountLogins([]).as('getAccountLogins');

    // Navigate to Login History landing page.
    cy.visitWithLogin('/account/login-history');
    cy.wait('@getAccountLogins');

    // Confirm helper text above table is visible.
    cy.findByText(loginHelperText).should('be.visible');

    cy.findByLabelText('Account Logins').within(() => {
      cy.get('thead').findByText('Date').should('be.visible');
      cy.get('thead').findByText('Username').should('be.visible');
      cy.get('thead').findByText('IP').should('be.visible');
      cy.get('thead').findByText('Permission Level').should('be.visible');
      cy.get('thead').findByText('Access').should('be.visible');
    });

    cy.get('[data-testid="table-row-empty"]')
      .should('be.visible')
      .within(() => {
        cy.findByText(loginEmptyStateMessageText).should('be.visible');
      });
  });
});
