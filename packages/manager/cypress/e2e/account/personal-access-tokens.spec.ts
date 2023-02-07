/**
 * @file Integration tests for personal access token CRUD operations.
 */

import { appTokenFactory } from 'src/factories/oauth';
import {
  mockGetPersonalAccessTokens,
  mockCreatePersonalAccessToken,
  mockGetAppTokens,
} from 'support/intercepts/profile';
import { randomLabel, randomString } from 'support/util/random';
import { ui } from 'support/ui';

describe('Personal access tokens', () => {
  it('can create personal access tokens', () => {
    const tokenLabel = randomLabel();
    const tokenSecret = randomString(64);
    const token = appTokenFactory.build({
      label: tokenLabel,
      token: tokenSecret,
    });

    mockGetPersonalAccessTokens([]).as('getTokens');
    mockGetAppTokens([]).as('getAppTokens');
    mockCreatePersonalAccessToken(token).as('createToken');

    cy.visitWithLogin('/profile/tokens');
    cy.wait(['@getTokens', '@getAppTokens']);

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
        cy.findByLabelText('Label')
          .should('be.visible')
          .should('be.enabled')
          .click()
          .type(tokenLabel);

        ui.buttonGroup
          .findButtonByTitle('Create Token')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

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
          .should('have.attr', 'value', tokenSecret);

        ui.button
          .findByTitle('I Have Saved My Personal Access Token')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@getTokens');
    cy.findByText(tokenLabel).should('be.visible');
  });

  it('can rename personal access tokens', () => {});

  it('can revoke personal access tokens', () => {});
});
