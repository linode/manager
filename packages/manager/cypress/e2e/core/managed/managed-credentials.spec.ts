/**
 * @file Integration tests for Managed credentials.
 */

import { visitUrlWithManagedEnabled } from 'support/api/managed';
import {
  mockCreateCredential,
  mockDeleteCredential,
  mockGetCredentials,
  mockUpdateCredential,
  mockUpdateCredentialUsernamePassword,
} from 'support/intercepts/managed';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';

import { credentialFactory } from 'src/factories/managed';

// Message that's shown when there are no Managed credentials.
const noCredentialsMessage = "You don't have any Credentials on your account.";

describe('Managed Credentials tab', () => {
  /*
   * - Confirms that Managed credentials are listed in the table.
   * - Confirms that a message is shown when there are no credentials.
   */
  it('shows a list of Managed credentials', () => {
    const credentialIds = [1, 2, 3, 4, 5];
    const credentials = credentialIds.map((id) => {
      return credentialFactory.build({
        id,
        label: `Credentials ${id}`,
      });
    });

    mockGetCredentials(credentials).as('getCredentials');
    visitUrlWithManagedEnabled('/managed/credentials');
    cy.wait('@getCredentials');

    // Confirm that each credential is listed.
    credentialIds.forEach((id) => {
      cy.findByText(`Credentials ${id}`).should('be.visible');
    });

    // Reset mocks and reload page, then confirm that no credentials are listed.
    mockGetCredentials([]).as('getCredentials');
    visitUrlWithManagedEnabled('/managed/credentials');
    cy.wait('@getCredentials');
    cy.findByText(noCredentialsMessage).should('be.visible');
  });

  /*
   * - Confirms UI flow for adding a Managed credential.
   * - Confirms that new credential is listed in the table.
   */
  it('can add Managed credentials', () => {
    const credentialLabel = randomString(10);
    const credentialUsername = randomString(10);
    const credentialPassword = randomString(32);

    const credential = credentialFactory.build({
      label: credentialLabel,
    });

    mockGetCredentials([]).as('getCredentials');
    mockCreateCredential(credential).as('createCredential');
    visitUrlWithManagedEnabled('/managed/credentials');
    cy.wait('@getCredentials');

    ui.button
      .findByTitle('Add Credential')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out Add Credential form and click 'Add Credential'.
    ui.drawer
      .findByTitle('Add Credential')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').should('be.visible').click();
        cy.focused().type(credentialLabel);

        cy.findByLabelText('Username', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().type(credentialUsername);

        cy.findByLabelText('Password').should('be.visible').click();
        cy.focused().type(credentialPassword);

        ui.buttonGroup
          .findButtonByTitle('Add Credential')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that new credential is listed in the table.
    cy.wait('@createCredential');
    cy.findByText(credentialLabel).should('be.visible');
  });

  /*
   * - Confirms UI flow for updating a Managed credential.
   * - Confirms that credential info is updated in table.
   */
  it('can update Managed credentials', () => {
    const credentialId = 1;
    const credentialOldLabel = randomLabel();
    const credentialNewLabel = randomLabel();

    const credential = credentialFactory.build({
      id: credentialId,
      label: credentialOldLabel,
    });

    const updatedCredential = {
      ...credential,
      label: credentialNewLabel,
    };

    mockGetCredentials([credential]).as('getCredentials');
    mockUpdateCredential(credentialId, updatedCredential).as(
      'updateCredential'
    );
    mockUpdateCredentialUsernamePassword(credentialId).as(
      'updateCredentialUsernamePassword'
    );
    visitUrlWithManagedEnabled('/managed/credentials');
    cy.wait('@getCredentials');

    // Find credential and click "Edit".
    cy.findByText(credentialOldLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Fill out forms to update credential label, and username/password pair.
    ui.drawer
      .findByTitle(`Edit Credential: ${credentialOldLabel}`)
      .should('be.visible')
      .within(() => {
        // Update label.
        cy.findByLabelText('Label').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(credentialNewLabel);

        ui.button
          .findByTitle('Update label')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@updateCredential');
        cy.findByText('Label updated successfully.').should('be.visible');

        // Update credentials.
        cy.findByLabelText('Username', { exact: false })
          .should('be.visible')
          .click();
        cy.focused().type(randomString());

        cy.findByLabelText('Password').should('be.visible').click();
        cy.focused().type(randomString());

        ui.button
          .findByTitle('Update credentials')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@updateCredentialUsernamePassword');
        cy.findByText('Updated successfully.').should('be.visible');

        // Close drawer.
        ui.drawerCloseButton
          .find()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that updated credential label is listed in table.
    cy.findByText(credentialNewLabel).should('be.visible');
  });

  /*
   * - Confirms UI flow for deleting a Managed credential.
   * - Confirms that credential is removed from table upon deletion.
   */
  it('can delete Managed credentials', () => {
    const credentialLabel = randomLabel();
    const credentialId = 1;

    const credential = credentialFactory.build({
      id: credentialId,
      label: credentialLabel,
    });

    mockGetCredentials([credential]).as('getCredentials');
    mockDeleteCredential(credentialId).as('deleteCredential');
    visitUrlWithManagedEnabled('/managed/credentials');
    cy.wait('@getCredentials');

    // Find mocked credential and click "Delete" button.
    cy.findByText(credentialLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Fill out and submit type-to-confirm.
    ui.dialog
      .findByTitle(`Delete Credential ${credentialLabel}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Credential Name:').should('be.visible').click();
        cy.focused().type(credentialLabel);

        ui.buttonGroup
          .findButtonByTitle('Delete Credential')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that toast notification is shown and credential is no longer listed.
    cy.wait('@deleteCredential');
    ui.toast.assertMessage('Credential deleted successfully.');
    cy.findByText(noCredentialsMessage).should('be.visible');
  });
});
