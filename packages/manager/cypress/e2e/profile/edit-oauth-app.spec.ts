import { fbtVisible, fbtClick, fbltClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  interceptGetProfile,
  mockGetOAuthApps,
  mockUpdateOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

describe('Edit OAuth Apps', () => {
  /*
   * - Edits an oauth app
   * - Confirms that nothing happens when cancelling the edition.
   * - Confirms that the oauth app is updated correctly on OAuth Apps landing page.
   */
  it('Edits an OAuth App', () => {
    const oauthApps = oauthClientFactory.buildList(2);
    const privateOauthApp = oauthApps[0];
    privateOauthApp.label = randomLabel(5);
    const publicOauApp = oauthApps[1];
    publicOauApp.label = randomLabel(5);
    publicOauApp.public = true;

    interceptGetProfile().as('getProfile');
    mockGetOAuthApps(oauthApps).as('getOAuthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getProfile');
    cy.wait('@getOAuthApps');

    // Nothing will happen when the edition is cancelled.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Edit');
        fbtClick('Edit');
      });
    ui.drawer
      .findByTitle('Create OAuth App')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // The drawer is no longer rendered or visible
    ui.drawer.find().should('not.exist');
    cy.findByText(privateOauthApp.label).should('be.visible');

    // Nothing will happen when clicking the 'X' button.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Edit');
        fbtClick('Edit');
      });
    ui.drawer.findByTitle('Create OAuth App').should('be.visible');
    ui.drawerCloseButton.find().click();

    // Confirm edition.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Edit');
        fbtClick('Edit');
      });

    // Deep copy the oauth apps array
    const updatedApps = JSON.parse(JSON.stringify(oauthApps));
    const modified = '-modified';
    updatedApps[0].label = privateOauthApp.label + modified;
    updatedApps[0].redirect_uri = privateOauthApp.redirect_uri + modified;
    mockGetOAuthApps(updatedApps).as('getUpdatedOAuthApps');
    mockUpdateOAuthApps(updatedApps[0].id, updatedApps).as('updateOAuthApp');
    ui.drawer
      .findByTitle('Create OAuth App')
      .should('be.visible')
      .within(() => {
        // If there is no changes, the 'save' button should disabled
        ui.buttonGroup
          .findButtonByTitle('Save Changes')
          .should('be.visible')
          .should('be.disabled');

        fbltClick('Label').clear().type(updatedApps[0].label);
        fbltClick('Callback URL').clear().type(updatedApps[0].label);

        ui.buttonGroup
          .findButtonByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // The drawer is no longer rendered or visible
    ui.drawer.find().should('not.exist');
    cy.wait('@getUpdatedOAuthApps');
    cy.wait('@updateOAuthApp');
    cy.findByText(privateOauthApp.label).should('not.exist');
    cy.findByText(updatedApps[0].label)
      .closest('tr')
      .within(() => {
        cy.findByText(updatedApps[0].label).should('be.visible');
        cy.findByText('Private').should('be.visible');
        cy.findByText(updatedApps[0].redirect_uri).should('be.visible');
      });
  });
});
