import { accountUserFactory } from 'src/factories/accountUsers';
import { getProfile } from 'support/api/account';
import {
  interceptGetUser,
  mockGetUser,
  mockGetUsers,
  mockUpdateUsername,
} from 'support/intercepts/account';
import { randomString } from 'support/util/random';
import { ui } from 'support/ui';

describe('User Profile', () => {
  /*
   * - Validates username update flow via the user profile page using mocked data.
   */
  it('can change username', () => {
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
   * - Validates disabled username and email flow for a proxy user profile using mocked data.
   */
  it('cannot change username or email for a proxy user or delete the proxy user', () => {
    getProfile().then((profile) => {
      const proxyUsername = 'proxy_user';
      const mockAccountUsers = accountUserFactory.buildList(1, {
        username: proxyUsername,
        user_type: 'proxy',
      });

      mockGetUsers(mockAccountUsers).as('getUsers');
      mockGetUser(mockAccountUsers[0]).as('getUser');

      cy.visitWithLogin(`account/users/${proxyUsername}`);

      cy.wait('@getUser');

      cy.findByText('Username').should('be.visible');
      cy.findByText('Email').should('be.visible');
      cy.findByText('Delete User').should('be.visible');

      cy.get('[id="username"]')
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
          ui.tooltip
            .findByText('This account type cannot update this field.')
            .should('be.visible');
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
          ui.tooltip
            .findByText('This account type cannot update this field.')
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

      // Confirms the proxy user cannot be deleted.
      ui.button
        .findByTitle('Delete')
        .should('be.visible')
        .should('be.disabled')
        .trigger('mouseover');
      // Click the button first, then confirm the tooltip is shown.
      ui.tooltip
        .findByText("You can't delete the proxy user.")
        .should('be.visible');
    });
  });
});
