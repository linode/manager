import { fbltClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import { interceptGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

/**
 * Creates an OAuth App with the given parameters.
 *
 * This assumes that the user has already navigated to the profile/clients
 * page.
 *
 * @param label - Label for the oauth app.
 * @param url - Callback URL for the oauth app.
 * @param isPublic - Access for the oauth app.
 */
const createOAuthApp = (label: string, url: string, isPublic: boolean) => {
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
      fbltClick('Label').clear().type(label);
      fbltClick('Callback URL').clear().type(url);
      ui.buttonGroup
        .findButtonByTitle('Cancel')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  cy.findByText(label).should('not.exist');

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
      fbltClick('Label').clear().type(label);
      fbltClick('Callback URL').clear().type(url);
      // Check the 'public' checkbox
      if (isPublic) {
        cy.get('[data-qa-checked]').should('be.visible').click();
      }
      ui.button
        .findByTitle('Create')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  ui.dialog
    .findByTitle('Client Secret')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('I Have Saved My Client Secret')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  // Confirms that the oauth app is listed on landing page with expected configuration.
  const accessLevel = isPublic ? 'Public' : 'Private';
  cy.findByText(label)
    .closest('tr')
    .within(() => {
      cy.findByText(label).should('be.visible');
      cy.findByText(accessLevel).should('be.visible');
      cy.findByText(url).should('be.visible');
    });
};

describe('Add OAuth Apps', () => {
  /*
   * - Adds an oauth app
   * - Confirms that nothing happens when cancelling the configuration.
   * - Confirms that an error message appears upon submitting without a label and a callback URL.
   * - Confirms that the oauth app is listed correctly on OAuth Apps landing page.
   */
  it('Adds an OAuth App', () => {
    const oauthApps = oauthClientFactory.buildList(2);
    const privateOauthApp = oauthApps[0];
    privateOauthApp.label = randomLabel(5);
    const publicOauApp = oauthApps[1];
    publicOauApp.label = randomLabel(5);
    publicOauApp.public = true;

    interceptGetProfile().as('getProfile');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getProfile');

    // Create a private access OAuth App
    createOAuthApp(
      privateOauthApp.label,
      privateOauthApp.redirect_uri,
      privateOauthApp.public
    );

    // Create a public access OAuth App
    createOAuthApp(
      publicOauApp.label,
      publicOauApp.redirect_uri,
      publicOauApp.public
    );
  });
});
