import { sshKeyFactory } from 'src/factories';
import {
  mockCreateSSHKey,
  mockCreateSSHKeyError,
  mockGetSSHKeys,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';
import { sshFormatErrorMessage } from 'support/constants/account';

describe('SSH keys', () => {
  /*
   * - Vaildates SSH key creation flow using mock data.
   * - Confirms that the drawer opens when clicking.
   * - Confirms that a form validation error appears when the label or public key is not present.
   * - Confirms UI flow when user enters incorrect public key.
   * - Confirms UI flow when user clicks "Cancel".
   * - Confirms UI flow when user creates a new SSH key.
   */
  it('adds an SSH key via Profile page as expected', () => {
    const randomKey = randomString(400, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      spaces: false,
      symbols: false,
    });
    const mockSSHKey = sshKeyFactory.build({
      label: randomLabel(),
      ssh_key: `ssh-rsa e2etestkey${randomKey} e2etest@linode`,
    });

    mockGetSSHKeys([]).as('getSSHKeys');

    // Navigate to SSH key landing page, click the "Add an SSH Key" button.
    cy.visitWithLogin('/profile/keys');
    cy.wait('@getSSHKeys');

    // When a user clicks "Add an SSH Key" button on SSH key landing page (/profile/keys), the "Add an SSH Key" drawer opens
    ui.button
      .findByTitle('Add an SSH Key')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.drawer
      .findByTitle('Add SSH Key')
      .should('be.visible')
      .within(() => {
        // When a user tries to create an SSH key without a label, a form validation error appears
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Label is required.');

        // When a user tries to create an SSH key without the SSH Public Key, a form validation error appears
        cy.get('[id="label"]').clear().type(mockSSHKey.label);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findAllByText(sshFormatErrorMessage).should('be.visible');

        // An alert displays when the format of SSH key is incorrect
        cy.get('[id="ssh-public-key"]').clear().type('WrongFormatSshKey');
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findAllByText(sshFormatErrorMessage).should('be.visible');

        cy.get('[id="ssh-public-key"]').clear().type(mockSSHKey.ssh_key);
        ui.button
          .findByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    // No new key is added when cancelling.
    cy.findAllByText(mockSSHKey.label).should('not.exist');

    mockGetSSHKeys([mockSSHKey]).as('getSSHKeys');
    mockCreateSSHKey(mockSSHKey).as('createSSHKey');

    ui.button
      .findByTitle('Add an SSH Key')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.drawer
      .findByTitle('Add SSH Key')
      .should('be.visible')
      .within(() => {
        // When a user clicks "Cancel" or the drawer's close button, and then clicks "Add an SSH Key" again, the content they previously entered into the form is erased
        cy.get('[id="label"]').should('be.empty');
        cy.get('[id="ssh-public-key"]').should('be.empty');

        // Create a new ssh key
        cy.get('[id="label"]').clear().type(mockSSHKey.label);
        cy.get('[id="ssh-public-key"]').clear().type(mockSSHKey.ssh_key);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@getSSHKeys');

    // When a user creates an SSH key, a toast notification appears that says "Successfully created SSH key."
    ui.toast.assertMessage('Successfully created SSH key.');

    // When a user creates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
    cy.findAllByText(mockSSHKey.label).should('be.visible');
  });

  /*
   * - Vaildates SSH key creation error flow using mock data.
   * - Confirms that a useful error message is displayed on the form when receiving an API response error.
   */
  it('shows an error message when fail to add an SSH key', () => {
    const errorMessage = 'failed to add an SSH key.';
    const sshKeyLabel = randomLabel();
    const randomKey = randomString(400, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      spaces: false,
      symbols: false,
    });
    const sshPublicKey = `ssh-rsa e2etestkey${randomKey} e2etest@linode`;

    mockCreateSSHKeyError(errorMessage).as('createSSHKeyError');
    mockGetSSHKeys([]).as('getSSHKeys');

    // Navigate to SSH key landing page, click the "Add an SSH Key" button.
    cy.visitWithLogin('/profile/keys');
    cy.wait('@getSSHKeys');

    // When a user clicks "Add an SSH Key" button on SSH key landing page (/profile/keys), the "Add an SSH Key" drawer opens
    ui.button
      .findByTitle('Add an SSH Key')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.drawer
      .findByTitle('Add SSH Key')
      .should('be.visible')
      .within(() => {
        // When a user clicks "Cancel" or the drawer's close button, and then clicks "Add an SSH Key" again, the content they previously entered into the form is erased
        cy.get('[id="label"]').should('be.empty');
        cy.get('[id="ssh-public-key"]').should('be.empty');

        // Create a new ssh key
        cy.get('[id="label"]').clear().type(sshKeyLabel);
        cy.get('[id="ssh-public-key"]').clear().type(sshPublicKey);
        ui.button
          .findByTitle('Add Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createSSHKeyError');

    // When the API responds with an error (e.g. a 400 response), the API response error message is displayed on the form
    cy.findByText(errorMessage);
  });
});
