import { fbtVisible, fbtClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  interceptGetProfile,
  mockDeleteOAuthApps,
  mockGetOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

describe('Delete OAuth Apps', () => {
  /*
   * - Deletes an oauth app
   * - Confirms that nothing happens when cancelling the deletion.
   * - Confirms that the oauth app is removed correctly on OAuth Apps landing page.
   */
  it('Deletes an OAuth App', () => {
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

    // Nothing will happen when the deletion is cancelled.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Delete');
        fbtClick('Delete');
      });
    ui.dialog
      .findByTitle(`Delete ${privateOauthApp.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // The diaglog is no longer rendered or visible
    ui.dialog.find().should('not.exist');
    cy.findByText(privateOauthApp.label).should('be.visible');

    // Confirm deletion.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Delete');
        fbtClick('Delete');
      });
    mockDeleteOAuthApps(privateOauthApp.id).as('deleteOAuthApp');
    mockGetOAuthApps(oauthApps.slice(1)).as('getDeletedOAuthApps');
    ui.dialog
      .findByTitle(`Delete ${privateOauthApp.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // The diaglog is no longer rendered or visible
    ui.dialog.find().should('not.exist');
    cy.wait('@deleteOAuthApp');
    cy.wait('@getDeletedOAuthApps');
    cy.findByText(privateOauthApp.label).should('not.exist');
  });
});
