import { profileFactory } from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { grantsFactory } from '@src/factories/grants';
import {
  mockGetUser,
  mockGetUserGrants,
  mockGetUsers,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { getProfile } from 'support/api/account';
import { interceptGetProfile } from 'support/intercepts/profile';
import {
  interceptGetUser,
  mockUpdateUsername,
} from 'support/intercepts/account';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';

describe('username', () => {
  /*
   * - Validates username update flow via the user profile page using mocked data.
   */
  it('can change username via user profile page', () => {
    const newUsername = randomString(12);

    getProfile().then((profile) => {
      const username = profile.body.username;

      interceptGetUser(username).as('getUser');
      mockUpdateUsername(username, newUsername).as('updateUsername');

      cy.visitWithLogin(`account/users/${username}`);
      cy.wait('@getUser');

      cy.findByText('Username').should('be.visible');
      cy.findByText('Email').should('be.visible');
      cy.findByText('Delete User').should('be.visible');

      cy.get('[id="username"]')
        .should('be.visible')
        .should('have.value', username)
        .clear()
        .type(newUsername);

      cy.get('[data-qa-textfield-label="Username"]')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@updateUsername');

      // No confirmation gets shown on this page when changes are saved.
      // Confirm that the text field has the correct value instead.
      cy.get('[id="username"]')
        .should('be.visible')
        .should('have.value', newUsername);
    });
  });

  /*
   * - Validates username update flow via the profile display page using mocked data.
   */
  it('can change username via profile display page', () => {
    const newUsername = randomString(12);

    getProfile().then((profile) => {
      const username = profile.body.username;

      interceptGetProfile().as('getUserProfile');
      mockUpdateUsername(username, newUsername).as('updateUsername');

      cy.visitWithLogin('/profile/display');
      cy.wait('@getUserProfile');

      ui.button
        .findByTitle('Update Username')
        .should('be.visible')
        .should('be.disabled');

      cy.findByLabelText('Username')
        .should('be.visible')
        .should('have.value', username)
        .clear()
        .type(newUsername);

      ui.button
        .findByTitle('Update Username')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@updateUsername');

      cy.findByLabelText('Username')
        .should('be.visible')
        .should('have.value', newUsername);

      cy.findByText('Username updated successfully.').should('be.visible');
    });
  });

  it('disables username/email fields for proxy user', () => {
    const mockRestrictedProxyUser = accountUserFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
    });

    const mockRestrictedProxyProfile = profileFactory.build({
      username: 'restricted-proxy-user',
      user_type: 'proxy',
    });

    const mockUserGrants = grantsFactory.build({
      global: { account_access: 'read_write' },
    });

    // TODO: Parent/Child - M3-7559 clean up when feature is live in prod and feature flag is removed.
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetUsers([mockRestrictedProxyUser]).as('getUsers');
    mockGetProfile(mockRestrictedProxyProfile);
    mockGetUser(mockRestrictedProxyUser);
    mockGetUserGrants(mockRestrictedProxyUser.username, mockUserGrants);

    // Navigate to User Profile page
    cy.visitWithLogin('/profile/display');

    // Confirm the username and email address fields are disabled, as well their respective save buttons
    cy.get('[id="username"]').should('be.disabled');
    ui.button
      .findByTitle('Update Username')
      .should('be.visible')
      .should('be.disabled')
      .click();
    // Click the button first, then confirm the tooltip is shown:
    ui.tooltip
      .findByText('This account type cannot update this field.')
      .should('be.visible');
    cy.get('[id="email"]').should('be.disabled');
    ui.button
      .findByTitle('Update Email')
      .should('be.visible')
      .should('be.disabled')
      .click();
    // Click the button first, then confirm the tooltip is shown:
    ui.tooltip
      .findByText('This account type cannot update this field.')
      .should('be.visible');
  });
});
