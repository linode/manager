import { fbtVisible, fbtClick, fbltClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  interceptGetProfile,
  mockGetOAuthApps,
  mockResetOAuthApps,
  mockUpdateOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomSecret } from 'support/util/random';

describe('Reset OAuth Apps', () => {
  /*
   * - Resets an oauth app
   * - Confirms that nothing happens when cancelling the edition.
   * - Confirms that the oauth app is reset correctly on OAuth Apps landing page.
   */
  it('Resets an OAuth App', () => {
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
        fbtVisible('Reset');
        fbtClick('Reset');
      });
    ui.dialog
      .findByTitle(`Reset secret for ${privateOauthApp.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.findByText(privateOauthApp.label).should('be.visible');

    // Confirm resetting.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Reset');
        fbtClick('Reset');
      });
    privateOauthApp['secret'] = randomSecret(64);
    mockResetOAuthApps(privateOauthApp.id, privateOauthApp).as('resetOAuthApp');
    ui.dialog
      .findByTitle(`Reset secret for ${privateOauthApp.label}?`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Reset Secret')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@resetOAuthApp');
    ui.dialog
      .findByTitle('Client Secret')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('I Have Saved My Client Secret')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.findByText(privateOauthApp.label).should('be.visible');
  });
});
