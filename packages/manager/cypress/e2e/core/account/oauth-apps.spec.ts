import { oauthClientFactory } from '@src/factories';
import {
  mockCreateOAuthApp,
  mockDeleteOAuthApps,
  mockGetOAuthApps,
  mockResetOAuthApps,
  mockUpdateOAuthApps,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomHex, randomLabel } from 'support/util/random';

import type { OAuthClient } from '@linode/api-v4';

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
      cy.findByLabelText('Label').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.label);
      cy.findByLabelText('Callback URL').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.redirect_uri);
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
      cy.findByLabelText('Label').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.label);
      cy.findByLabelText('Callback URL').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.redirect_uri);
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
      cy.findByLabelText('Label').click();
      cy.focused().clear();
      cy.findByLabelText('Callback URL').click();
      cy.focused().clear();
      ui.button
        .findByTitle('Create')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.findByText('Label is required.');
      cy.findByText('Redirect URI is required.');

      // Fill out and submit OAuth App create form.
      cy.findByLabelText('Label').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.label);
      cy.findByLabelText('Callback URL').click();
      cy.focused().clear();
      cy.focused().type(oauthApp.redirect_uri);
      // Uncheck the 'public' checkbox
      if (!oauthApp.public) {
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

describe('OAuth Apps', () => {
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
        public: true,
        secret: randomHex(64),
      }),
    ];

    const privateOauthApp = oauthApps[0];
    const publicOauthApp = oauthApps[1];

    mockGetOAuthApps([]).as('getOauthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getOauthApps');

    cy.findByText('No items to display.');

    // Create a private access OAuth App
    mockGetOAuthApps([privateOauthApp]).as('getOauthApps');
    createOAuthApp(privateOauthApp);
    cy.wait('@getOauthApps');
    cy.findByText(privateOauthApp.label).should('be.visible');

    // Create a public access OAuth App
    mockGetOAuthApps(oauthApps).as('getOauthApps');
    createOAuthApp(publicOauthApp);
    cy.wait('@getOauthApps');

    // Confirms that the oauth app is listed on landing page with expected configuration.
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

    mockGetOAuthApps(oauthApps).as('getOAuthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getOAuthApps');

    // Nothing will happen when the deletion is cancelled.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Delete').should('be.visible').click();
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
        cy.findByText('Delete').should('be.visible').click();
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

    mockGetOAuthApps(oauthApps).as('getOAuthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getOAuthApps');

    // Nothing will happen when the edition is cancelled.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Edit').should('be.visible').click();
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
        cy.findByText('Edit').should('be.visible').click();
      });
    ui.drawer.findByTitle('Create OAuth App').should('be.visible');
    ui.drawerCloseButton.find().click();

    // Confirm edition.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Edit').should('be.visible').click();
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

        cy.findByLabelText('Label').click();
        cy.focused().clear();
        cy.focused().type(updatedApps[0].label);
        cy.findByLabelText('Callback URL').click();
        cy.focused().clear();
        cy.focused().type(updatedApps[0].label);

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

    mockGetOAuthApps([privateOauthApp]).as('getOAuthApps');
    cy.visitWithLogin('/profile/clients');
    cy.wait('@getOAuthApps');

    // Nothing will happen when the edition is cancelled.
    cy.findByText(privateOauthApp.label)
      .closest('tr')
      .within(() => {
        cy.findByText('Reset').should('be.visible').click();
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
        cy.findByText('Reset').should('be.visible').click();
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
