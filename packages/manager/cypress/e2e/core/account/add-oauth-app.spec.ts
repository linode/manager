import { fbltClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  interceptGetProfile,
  mockCreateOAuthApp,
  mockGetOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomHex } from 'support/util/random';
import { OAuthClient } from '@linode/api-v4/types';

/**
 * Creates an OAuth App with the given parameters.
 *
 * This assumes that the user has already navigated to the profile/clients
 * page.
 *
 * @param oauthClient - OAuth app to mock.
 */
const createOAuthApp = (oauthApp: OAuthClient) => {
  ui.button
    .findByTitle('Add an OAuth App')
    .should('be.visible')
    .should('be.enabled')
    .click();

  // Nothing will happen when cancelling.
  ui.drawer
    .findByTitle('Create OAuth App')
    .should('be.visible')
    .within(() => {
      fbltClick('Label').clear().type(oauthApp.label);
      fbltClick('Callback URL').clear().type(oauthApp.redirect_uri);
      ui.buttonGroup
        .findButtonByTitle('Cancel')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  // The drawer is no longer rendered or visible
  ui.drawer.find().should('not.exist');
  cy.findByText(oauthApp.label).should('not.exist');

  // Nothing will happen when clicking the 'X' button.
  ui.button
    .findByTitle('Add an OAuth App')
    .should('be.visible')
    .should('be.enabled')
    .click();
  ui.drawer
    .findByTitle('Create OAuth App')
    .should('be.visible')
    .within(() => {
      fbltClick('Label').clear().type(oauthApp.label);
      fbltClick('Callback URL').clear().type(oauthApp.redirect_uri);
    });
  ui.drawerCloseButton.find().click();

  // The drawer is no longer rendered or visible
  ui.drawer.find().should('not.exist');
  cy.findByText(oauthApp.label).should('not.exist');

  // Add an oauth app
  ui.button
    .findByTitle('Add an OAuth App')
    .should('be.visible')
    .should('be.enabled')
    .click();

  ui.drawer
    .findByTitle('Create OAuth App')
    .should('be.visible')
    .within(() => {
      // An error message appears when attempting to create an OAuth App without a label
      fbltClick('Label').clear();
      fbltClick('Callback URL').clear();
      ui.button
        .findByTitle('Create')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.findByText('Label is required.');
      cy.findByText('Redirect URI is required.');

      // Fill out and submit OAuth App create form.
      fbltClick('Label').clear().type(oauthApp.label);
      fbltClick('Callback URL').clear().type(oauthApp.redirect_uri);
      // Check the 'public' checkbox
      if (oauthApp.public) {
        cy.get('[data-qa-checked]').should('be.visible').click();
      }
      mockCreateOAuthApp(oauthApp).as('createOauthApp');
      ui.button
        .findByTitle('Create')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.wait('@createOauthApp');
    });

  ui.dialog
    .findByTitle('Client Secret')
    .should('be.visible')
    .within(() => {
      cy.get('input[id="client-secret"]')
        .should('be.visible')
        .should('have.value', oauthApp.secret);

      ui.button
        .findByTitle('I Have Saved My Client Secret')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  // The drawer/diaglog is no longer rendered or visible
  ui.drawer.find().should('not.exist');
  ui.dialog.find().should('not.exist');
};

describe('Add OAuth Apps', () => {
  /*
   * - Adds an oauth app
   * - Confirms that nothing happens when cancelling the configuration.
   * - Confirms that an error message appears upon submitting without a label and a callback URL.
   * - Confirms that the oauth app is listed correctly on OAuth Apps landing page.
   */
  it('Adds an OAuth App', () => {
    const oauthApps = [
      oauthClientFactory.build({
        label: randomLabel(),
        secret: randomHex(64),
      }),
      oauthClientFactory.build({
        label: randomLabel(),
        secret: randomHex(64),
        public: true,
      }),
    ];

    const privateOauthApp = oauthApps[0];
    const publicOauthApp = oauthApps[1];

    interceptGetProfile().as('getProfile');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getProfile');

    // Create a private access OAuth App
    createOAuthApp(privateOauthApp);

    // Create a public access OAuth App
    createOAuthApp(publicOauthApp);

    // Confirms that the oauth app is listed on landing page with expected configuration.
    interceptGetProfile().as('getProfile');
    mockGetOAuthApps(oauthApps).as('getOAuthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait(['@getProfile', '@getOAuthApps']);
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText(privateOauthApp.label).should('be.visible');
        cy.findByText('Private').should('be.visible');
        cy.findByText(privateOauthApp.redirect_uri).should('be.visible');
      });
    cy.findByText(publicOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText(publicOauthApp.label).should('be.visible');
        cy.findByText('Public').should('be.visible');
        cy.findByText(publicOauthApp.redirect_uri).should('be.visible');
      });
  });
});
