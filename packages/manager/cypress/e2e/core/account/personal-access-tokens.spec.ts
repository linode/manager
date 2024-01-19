/**
 * @file Integration tests for personal access token CRUD operations.
 */

import { Token } from '@linode/api-v4';
import { appTokenFactory } from 'src/factories/oauth';
import {
  mockCreatePersonalAccessToken,
  mockGetAppTokens,
  mockGetPersonalAccessTokens,
  mockRevokePersonalAccessToken,
  mockUpdatePersonalAccessToken,
} from 'support/intercepts/profile';
import { randomLabel, randomString } from 'support/util/random';
import { ui } from 'support/ui';

describe('Personal access tokens', () => {
  /*
   * - Uses mocked API requests to confirm UI flow to create a personal access token
   * - Confirms that user is shown an error upon attempting creation without a label
   * - Confirms that user is shown the token secret upon successful PAT creation
   * - Confirms that new personal access token is shown in list
   * - Confirms that user can open and close "View Scopes" drawer
   */
  it('can create personal access tokens', () => {
    const token = appTokenFactory.build({
      label: randomLabel(),
      token: randomString(64),
    });

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    mockCreatePersonalAccessToken(token).as('createToken');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);

    // Confirm that no PATs or 3rd party app tokens are listed.
    cy.findByLabelText('List of Personal Access Tokens')
      .should('be.visible')
      .within(() => {
        cy.findByText('No items to display.').should('be.visible');
      });

    cy.findByLabelText('List of Third Party Access Tokens')
      .should('be.visible')
      .within(() => {
        cy.findByText('No items to display.').should('be.visible');
      });

    // Click create button, fill out and submit PAT create form.
    ui.button
      .findByTitle('Create a Personal Access Token')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockGetPersonalAccessTokens([token]).as('getTokens');
    ui.drawer
      .findByTitle('Add Personal Access Token')
      .should('be.visible')
      .within(() => {
        // Attempt to submit form without specifying a label
        ui.buttonGroup
          .findButtonByTitle('Create Token')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.findByText('Label must be between 1 and 100 characters.')
          .scrollIntoView()
          .should('be.visible');

        // Specify a label and re-submit.
        cy.findByLabelText('Label')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click()
          .type(token.label);

        ui.buttonGroup
          .findButtonByTitle('Create Token')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that PAT secret dialog is shown and close it.
    cy.wait('@createToken');
    ui.dialog
      .findByTitle('Personal Access Token')
      .should('be.visible')
      .within(() => {
        // Confirm that user is informed that PAT is only shown once, and that
        // it cannot be recovered.
        cy.findByText('we can only display your personal access token once', {
          exact: false,
        }).should('be.visible');
        cy.findByText('it can’t be recovered', { exact: false }).should(
          'be.visible'
        );

        // Confirm that PAT is shown.
        cy.get('[data-testid="textfield-input"]')
          .should('be.visible')
          .should('have.attr', 'value', token.token);

        ui.button
          .findByTitle('I Have Saved My Personal Access Token')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new PAT is shown in list and "View Scopes" drawer works.
    cy.wait('@getTokens');
    cy.findByText(token.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('View Scopes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.drawer
      .findByTitle(token.label)
      .should('be.visible')
      .within(() => {
        ui.drawerCloseButton.find().click();
      });
  });

  /*
   * - Uses mocked API requests to confirm UI flow when renaming and revoking tokens
   * - Confirms that list shows the correct label after renaming a token
   * - Confirms that token is removed from list after revoking it
   */
  it('can rename and revoke personal access tokens', () => {
    const oldToken: Token = appTokenFactory.build({
      label: randomLabel(),
      token: randomString(64),
    });

    const newToken: Token = {
      ...oldToken,
      label: randomLabel(),
    };

    mockGetPersonalAccessTokens([oldToken]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    mockUpdatePersonalAccessToken(oldToken.id, newToken).as('updateToken');
    mockRevokePersonalAccessToken(oldToken.id).as('revokeToken');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);

    // Find token in list, click "Rename", and fill out and submit form.
    cy.findByText(oldToken.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Rename')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.drawer
      .findByTitle('Edit Personal Access Token')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .click()
          .clear()
          .type(newToken.label);

        ui.buttonGroup
          .findButtonByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that token has been renamed, initiate revocation.
    cy.wait('@updateToken');
    cy.findByText(newToken.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Revoke')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetPersonalAccessTokens([]).as('getTokens');
    ui.dialog
      .findByTitle(`Revoke ${newToken.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Revoke')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that token is removed from list after revoking.
    cy.wait(['@revokeToken', '@getTokens']);
    ui.toast.assertMessage(`Successfully revoked ${newToken.label}`);
    cy.findByLabelText('List of Personal Access Tokens')
      .should('be.visible')
      .within(() => {
        cy.findByText(newToken.label).should('not.exist');
        cy.findByText('No items to display.').should('be.visible');
      });
  });
});
