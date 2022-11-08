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
});
