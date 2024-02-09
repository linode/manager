/**
 * @file Integration tests for Cloud Manager account login history flows.
 */

import { accountFactory, profileFactory } from 'src/factories';
import { accountLoginFactory } from 'src/factories/accountLogin';
import { formatDate } from 'src/utilities/formatDate';
import {
  mockGetAccount,
  mockGetAccountLogins,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { makeFeatureFlagData } from 'support/util/feature-flags';

describe('Account login history', () => {
  /*
   * - Confirms that a user can navigate to and view the login history page.
   * - Confirms that login table displays the expected column headers.
   * - Confirms that the login table displays a mocked failed restricted user login.
   * - Confirm that the login table displays a mocked successful unrestricted user login.
   */
  it('users can view the login history table', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-user',
      restricted: false,
      user_type: null,
    });
    const mockFailedLogin = accountLoginFactory.build({
      status: 'failed',
      username: 'mock-restricted-user',
      restricted: true,
    });
    const mockSuccessfulLogin = accountLoginFactory.build({
      status: 'successful',
      restricted: false,
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccountLogins([mockFailedLogin, mockSuccessfulLogin]).as(
      'getAccountLogins'
    );

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait([
      '@getAccount',
      '@getClientStream',
      '@getFeatureFlags',
      '@getProfile',
    ]);

    // Confirm helper text above table is visible.
    cy.findByText(
      'Logins across all users on your account over the last 90 days.'
    ).should('be.visible');

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
          cy.findByText(mockSuccessfulLogin.status, { exact: false }).should(
            'be.visible'
          );
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
   * - Confirms that a child user cannot see login history data.
   * - Confirms that a child user sees a notice instead.
   */
  it('child users cannot view login history', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-child-user',
      restricted: false,
      user_type: 'child',
    });

    mockGetAccount(mockAccount).as('getAccount');
    mockGetProfile(mockProfile).as('getProfile');

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait([
      '@getAccount',
      '@getClientStream',
      '@getFeatureFlags',
      '@getProfile',
    ]);

    // Confirm helper text above table and table are not visible.
    cy.findByText(
      'Logins across all users on your account over the last 90 days.'
    ).should('not.exist');
    cy.findByLabelText('Account Logins').should('not.exist');

    cy.findByText(
      'Access restricted. Please contact your business partner to request the necessary permission.'
    );
  });

  /**
   * - Confirms that a restricted user can navigate to the Login History page.
   * - Confirms that a restricted user cannot see login history data.
   * - Confirms that a restricted user sees a notice instead.
   */
  it('restricted users cannot view login history', () => {
    const mockAccount = accountFactory.build();
    const mockProfile = profileFactory.build({
      username: 'mock-restricted-user',
      restricted: true,
      user_type: null,
    });

    mockGetProfile(mockProfile).as('getProfile');
    mockGetAccount(mockAccount).as('getAccount');

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Navigate to Account Login History page.
    cy.visitWithLogin('/account/login-history');
    cy.wait([
      '@getAccount',
      '@getClientStream',
      '@getFeatureFlags',
      '@getProfile',
    ]);

    // Confirm helper text above table and table are not visible.
    cy.findByText(
      'Logins across all users on your account over the last 90 days.'
    ).should('not.exist');
    cy.findByLabelText('Account Logins').should('not.exist');

    cy.findByText(
      'Access restricted. Please contact your account administrator to request the necessary permission.'
    );
  });
});
