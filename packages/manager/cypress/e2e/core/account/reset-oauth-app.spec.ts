import { fbtVisible, fbtClick } from 'support/helpers';
import { oauthClientFactory } from '@src/factories';
import 'cypress-file-upload';
import {
  interceptGetProfile,
  mockGetOAuthApps,
  mockResetOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomHex } from 'support/util/random';

describe('Reset OAuth Apps', () => {
  /*
   * - Resets an oauth app
   * - Confirms that nothing happens when cancelling the edition.
   * - Confirms that the oauth app is reset correctly on OAuth Apps landing page.
   */
  it('Resets an OAuth App', () => {
    const privateOauthApp = oauthClientFactory.build({
      label: randomLabel(5),
      secret: randomHex(64),
    });

    interceptGetProfile().as('getProfile');
    mockGetOAuthApps([privateOauthApp]).as('getOAuthApps');
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
    // The dialog is no longer rendered or visible
    ui.dialog.find().should('not.exist');
    cy.findByText(privateOauthApp.label).should('be.visible');

    // Confirm resetting.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        fbtVisible('Reset');
        fbtClick('Reset');
      });

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
    // The dialog is no longer rendered or visible
    ui.dialog.find().should('not.exist');
    cy.findByText(privateOauthApp.label).should('be.visible');
  });
});
