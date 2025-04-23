/**
 * @file Integration tests for Managed SSH access.
 */

import { linodeFactory } from '@linode/utilities';
import { visitUrlWithManagedEnabled } from 'support/api/managed';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import {
  mockGetLinodeSettings,
  mockGetSshPublicKey,
  mockUpdateLinodeSettings,
} from 'support/intercepts/managed';
import { ui } from 'support/ui';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';

import {
  managedLinodeSettingFactory,
  managedSSHSettingFactory,
} from 'src/factories/managed';

import type { ManagedLinodeSetting } from '@linode/api-v4';

// Message that is shown when no Linodes are listed.
const noLinodesMessage = "You don't have any Linodes on your account.";

/**
 * Generates a random SSH public key to use for mocking.
 *
 * @returns Random SSH public key.
 */
const randomPublicSshKey = (): string => {
  const randomKey = randomString(400, {
    lowercase: true,
    numbers: true,
    spaces: false,
    symbols: false,
    uppercase: true,
  });

  return `ssh-rsa e2etestkey${randomKey} managedservices@linode`;
};

describe('Managed SSH Access tab', () => {
  /*
   * - Confirms that Linode public SSH key for Managed account is shown.
   * - Confirms that each managed Linode is listed in the table.
   * - Confirms that a message is shown when there are no managed Linodes.
   */
  it('shows Managed SSH access info and list of Linodes', () => {
    const sshKey = randomPublicSshKey();
    const mockManagedLinodes = managedLinodeSettingFactory.buildList(5);

    // Confirm that public SSH key is shown, and managed Linodes are shown.
    mockGetSshPublicKey(sshKey).as('getSshPublicKey');
    mockGetLinodeSettings(mockManagedLinodes).as('getLinodeSettings');

    visitUrlWithManagedEnabled('/managed/ssh-access');
    cy.wait(['@getSshPublicKey', '@getLinodeSettings']);

    cy.findByText(sshKey).should('be.visible');
    mockManagedLinodes.forEach((mockManagedLinode: ManagedLinodeSetting) => {
      cy.findByText(mockManagedLinode.label).should('be.visible');
    });

    // Reset mocks, reload page, confirm that no managed Linodes are shown.
    mockGetLinodeSettings([]).as('getLinodeSettings');
    visitUrlWithManagedEnabled('/managed/ssh-access');
    cy.wait(['@getSshPublicKey', '@getLinodeSettings']);
    cy.findByText(noLinodesMessage).should('be.visible');
  });

  /*
   * - Confirm UI flow for updating managed Linode SSH access settings.
   * - Confirm updated SSH access settings are shown in table.
   * - Confirm UI flow for enabling/disabling SSH access via table row button and drawer toggle button.
   */
  it('can update managed Linode SSH access', () => {
    const linodeLabel = randomLabel();
    const linodeId = 1;
    const linode = linodeFactory.build({
      id: linodeId,
      label: linodeLabel,
    });

    const newPort = randomNumber(65535);
    const newUser = randomString(8);

    // Mock Linode settings to use before updating settings.
    const originalLinodeSettings = managedLinodeSettingFactory.build({
      id: 1,
      label: linodeLabel,
      ssh: managedSSHSettingFactory.build({
        ip: randomIp(),
      }),
    });

    // Mock Linode settings to reflect updated settings.
    const newLinodeSettings = {
      ...originalLinodeSettings,
      ssh: {
        ...originalLinodeSettings.ssh,
        ip: 'any',
        port: newPort,
        user: newUser,
      },
    };

    // Mock Linode settings to reflect updated settings with disabled access.
    const newLinodeDisabledSettings = {
      ...newLinodeSettings,
      ssh: {
        ...newLinodeSettings.ssh,
        access: false,
      },
    };

    mockGetLinodeDetails(linodeId, linode).as('getLinode');
    mockGetSshPublicKey(randomPublicSshKey()).as('getSshPublicKey');
    mockGetLinodeSettings([originalLinodeSettings]).as('getLinodeSettings');
    visitUrlWithManagedEnabled('/managed/ssh-access');
    cy.wait(['@getSshPublicKey', '@getLinodeSettings']);

    cy.findByText(linodeLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@getLinode');

    // Fill out and submit SSH access edit form.
    mockUpdateLinodeSettings(linodeId, newLinodeSettings).as(
      'updateLinodeSettings'
    );
    ui.drawer
      .findByTitle(`Edit SSH Access for ${linodeLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('User Account').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(newUser);

        // Set IP address to 'Any'.
        cy.findByLabelText('IP Address').should('be.visible').click();
        cy.focused().type('Any{enter}');

        cy.findByLabelText('Port').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(`${newPort}`);

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that updated Linode SSH access settings are shown in the table,
    // then click "Disable".
    cy.wait('@updateLinodeSettings');
    mockUpdateLinodeSettings(linodeId, newLinodeDisabledSettings).as(
      'updateLinodeSettings'
    );
    cy.findByText(linodeLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(newUser).should('be.visible');
        cy.findByText(newPort).should('be.visible');
        cy.findByText('Any').should('be.visible');

        ui.button
          .findByTitle('Disable')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that Linode SSH access is disabled, then click "Edit".
    cy.wait('@updateLinodeSettings');
    ui.toast.assertMessage('SSH Access disabled successfully.');
    cy.findByText(linodeLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Disabled').should('be.visible');

        ui.button
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Use toggle button to enable SSH access, then click "Save Changes".
    mockUpdateLinodeSettings(linodeId, newLinodeSettings).as(
      'updateLinodeSettings'
    );
    ui.drawer
      .findByTitle(`Edit SSH Access for ${linodeLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByText('Access disabled').should('be.visible').click();

        ui.button
          .findByTitle('Save Changes')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that Linode SSH access is re-enabled.
    // No toast notification is shown when enabling/disabling via drawer.
    cy.wait('@updateLinodeSettings');
    cy.findByText(linodeLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
      });
  });
});
