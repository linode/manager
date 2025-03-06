import { getProfile } from 'support/api/account';
import {
  interceptGetUser,
  mockGetUser,
  mockGetUsers,
  mockUpdateUsername,
} from 'support/intercepts/account';
import { mockUpdateProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomString } from 'support/util/random';

import { accountUserFactory } from 'src/factories/accountUsers';
import {
  PARENT_USER,
  RESTRICTED_FIELD_TOOLTIP,
} from 'src/features/Account/constants';

describe('User Profile', () => {
  /*
   * - Validates the flow of updating the username and email of the active account user via the User Profile page using mocked data.
   */
  it('can change email and username of the active account', () => {
    const newUsername = randomString(12);
    const newEmail = `${newUsername}@example.com`;

    getProfile().then((profile) => {
      const activeUsername = profile.body.username;
      const activeEmail = profile.body.email;

      interceptGetUser(activeUsername).as('getUser');
      mockUpdateUsername(activeUsername, newUsername).as('updateUsername');
      mockUpdateProfile({
        ...profile.body,
        email: newEmail,
      }).as('updateEmail');

      cy.visitWithLogin(`account/users/${activeUsername}`);
      cy.wait('@getUser');

      cy.findByLabelText('Username').should('be.visible');
      cy.findByLabelText('Email').should('be.visible');
      cy.findByText('Delete User').should('be.visible');

      // Confirm the currently active user cannot be deleted.
      ui.button
        .findByTitle('Delete')
        .should('be.visible')
        .should('be.disabled')
        .trigger('mouseover');
      // Click the button first, then confirm the tooltip is shown.
      ui.tooltip
        .findByText('You can\u{2019}t delete the currently active user.')
        .should('be.visible');

      // Confirm user can update their email before updating the username, since you cannot update a different user's (as determined by username) email.
      cy.get('[id="email"]')
        .should('be.visible')
        .should('have.value', activeEmail)
        .clear();
      cy.focused().type(newEmail);

      cy.get('[data-qa-textfield-label="Email"]')
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

      cy.wait('@updateEmail');

      // Confirm success notice displays.
      cy.findByText('Email updated successfully').should('be.visible');

      // Confirm user can update their username.
      cy.get('[id="username"]')
        .should('be.visible')
        .should('have.value', activeUsername)
        .clear();
      cy.focused().type(newUsername);

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
   * - Validates the flow of updating the username and email of another user via the User Profile page using mocked data.
   */
  it('can change the username but not email of another user account', () => {
    const newUsername = randomString(12);

    getProfile().then((profile) => {
      const additionalUsername = 'mock_user2';
      const mockAccountUsers = accountUserFactory.buildList(1, {
        username: additionalUsername,
      });
      const additionalUser = mockAccountUsers[0];

      mockGetUsers(mockAccountUsers).as('getUsers');
      mockGetUser(additionalUser).as('getUser');
      mockUpdateUsername(additionalUsername, newUsername).as('updateUsername');

      cy.visitWithLogin(`account/users/${additionalUsername}`);

      cy.wait('@getUser');

      cy.findByLabelText('Username').should('be.visible');
      cy.findByLabelText('Email').should('be.visible');
      cy.findByText('Delete User').should('be.visible');
      ui.button.findByTitle('Delete').should('be.visible').should('be.enabled');

      // Confirm email of another user cannot be updated.
      cy.get('[id="email"]')
        .should('be.visible')
        .should('have.value', additionalUser.email)
        .should('be.disabled')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByAttribute('data-qa-help-button', 'true')
            .should('be.visible')
            .trigger('mouseover');
          // Click the button first, then confirm the tooltip is shown.
          ui.tooltip
            .findByText(
              'You can\u{2019}t change another user\u{2019}s email address.'
            )
            .should('be.visible');
        });

      cy.get('[data-qa-textfield-label="Email"]')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.disabled')
            .click();
        });

      // Confirm username of another user can be updated.
      cy.get('[id="username"]')
        .should('be.visible')
        .should('have.value', additionalUsername)
        .clear();
      cy.focused().type(newUsername);

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
   * - Validates disabled username and email flow for a proxy user via the User Profile page using mocked data.
   */
  it('cannot change username or email for a proxy user or delete the proxy user', () => {
    getProfile().then((profile) => {
      const proxyUsername = 'proxy_user';
      const mockAccountUsers = accountUserFactory.buildList(1, {
        user_type: 'proxy',
        username: proxyUsername,
      });

      mockGetUsers(mockAccountUsers).as('getUsers');
      mockGetUser(mockAccountUsers[0]).as('getUser');

      cy.visitWithLogin(`account/users/${proxyUsername}`);

      cy.wait('@getUser');

      cy.findByLabelText('Username').should('be.visible');
      cy.findByLabelText('Email').should('be.visible');
      cy.findByText('Delete User').should('be.visible');

      cy.get('[id="username"]')
        .should('be.visible')
        .should('have.value', proxyUsername)
        .should('be.disabled')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByAttribute('data-qa-help-button', 'true')
            .should('be.visible')
            .trigger('mouseover');
          // Click the button first, then confirm the tooltip is shown.
          ui.tooltip.findByText(RESTRICTED_FIELD_TOOLTIP).should('be.visible');
        });

      cy.get('[data-qa-textfield-label="Username"]')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.disabled');
        });

      cy.get('[id="email"]')
        .should('be.visible')
        .should('be.disabled')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByAttribute('data-qa-help-button', 'true')
            .should('be.visible')
            .trigger('mouseover');
          // Click the button first, then confirm the tooltip is shown.
          ui.tooltip.findByText(RESTRICTED_FIELD_TOOLTIP).should('be.visible');
        });

      cy.get('[data-qa-textfield-label="Email"]')
        .parent()
        .parent()
        .parent()
        .within(() => {
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.disabled')
            .click();
        });

      // Confirms the proxy user cannot be deleted.
      ui.button
        .findByTitle('Delete')
        .should('be.visible')
        .should('be.disabled')
        .trigger('mouseover');
      // Click the button first, then confirm the tooltip is shown.
      ui.tooltip
        .findByText(`You can\u{2019}t delete a ${PARENT_USER}.`)
        .should('be.visible');
    });
  });
});
