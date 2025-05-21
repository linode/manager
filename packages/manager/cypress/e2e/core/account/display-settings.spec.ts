import { grantsFactory, profileFactory } from '@linode/utilities';
import { getProfile } from 'support/api/account';
import { mockUpdateUsername } from 'support/intercepts/account';
import {
  interceptGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';

import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';

import type { Profile } from '@linode/api-v4';

const verifyUsernameAndEmail = (
  mockRestrictedProxyProfile: Profile,
  tooltip: string,
  checkEmail: boolean
) => {
  mockGetProfile(mockRestrictedProxyProfile);

  // Navigate to User Profile page
  cy.visitWithLogin('/profile/display');

  // Confirm the username and email address fields are disabled, as well their respective save buttons
  cy.get('[id="username"]').should('be.disabled');
  ui.button
    .findByTitle('Update Username')
    .should('be.visible')
    .should('be.disabled')
    .trigger('mouseover');
  // Click the button first, then confirm the tooltip is shown
  ui.tooltip.findByText(tooltip).should('be.visible');

  // Refresh the page
  mockGetProfile(mockRestrictedProxyProfile);
  cy.reload();

  if (checkEmail) {
    cy.get('[id="email"]').should('be.disabled');
    ui.button
      .findByTitle('Update Email')
      .should('be.visible')
      .should('be.disabled')
      .trigger('mouseover');
    // Click the button first, then confirm the tooltip is shown
    ui.tooltip.findByText(RESTRICTED_FIELD_TOOLTIP).should('be.visible');
  }
};

describe('Display Settings', () => {
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
        .clear();
      cy.focused().type(newUsername);

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

  it('disables username/email fields for restricted proxy user', () => {
    const mockRestrictedProxyProfile = profileFactory.build({
      restricted: true,
      user_type: 'proxy',
      username: 'restricted-proxy-user',
    });

    const mockGrants = grantsFactory.build();
    mockGetProfileGrants(mockGrants);

    verifyUsernameAndEmail(
      mockRestrictedProxyProfile,
      RESTRICTED_FIELD_TOOLTIP,
      true
    );
  });

  it('disables username/email fields for unrestricted proxy user', () => {
    const mockUnrestrictedProxyProfile = profileFactory.build({
      user_type: 'proxy',
      username: 'unrestricted-proxy-user',
    });

    verifyUsernameAndEmail(
      mockUnrestrictedProxyProfile,
      RESTRICTED_FIELD_TOOLTIP,
      true
    );
  });

  it('disables username/email fields for regular restricted user', () => {
    const mockRegularRestrictedProfile = profileFactory.build({
      restricted: true,
      user_type: 'default',
      username: 'regular-restricted-user',
    });

    const mockGrants = grantsFactory.build();
    mockGetProfileGrants(mockGrants);

    verifyUsernameAndEmail(
      mockRegularRestrictedProfile,
      'Restricted users cannot update their username. Please contact an account administrator.',
      false
    );
  });
});
