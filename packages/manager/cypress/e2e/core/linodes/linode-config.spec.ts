import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { interceptRebootLinode } from 'support/intercepts/linodes';
import {
  interceptDeleteLinodeConfig,
  interceptCreateLinodeConfigs,
  interceptUpdateLinodeConfigs,
} from 'support/intercepts/configs';
import {
  createLinodeAndGetConfig,
  createAndBootLinode,
} from 'support/util/linode-utils';

import type { Config, Linode } from '@linode/api-v4';

authenticate();

describe('Linode Config', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

  it('Creates a new config and list all configs', () => {
    createLinode().then((linode: Linode) => {
      interceptCreateLinodeConfigs(linode.id).as('postLinodeConfigs');

      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('My Debian 10 Disk Profile – GRUB 2');
      });
      containsVisible('My Debian 10 Disk Profile – GRUB 2');

      cy.findByText('Add Configuration').click();
      ui.dialog
        .findByTitle('Add Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#label').type(`${linode.id}-test-config`);
          ui.buttonGroup
            .findButtonByTitle('Add Configuration')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@postLinodeConfigs')
        .its('response.statusCode')
        .should('eq', 200);

      cy.findByLabelText('List of Configurations').within(() => {
        cy.get('tr').should('have.length', 2);
        containsVisible(
          `${linode.id}-test-config – Latest 64 bit (6.2.9-x86_64-linode160)`
        );
        containsVisible('eth0 – Public Internet');
      });
    });
  });

  it('Edits an existing config', () => {
    cy.defer(
      createLinodeAndGetConfig({
        waitForLinodeToBeRunning: false,
        linodeConfigRequestOverride: {
          label: 'cy-test-edit-config-linode',
          interfaces: [
            {
              ipam_address: '',
              label: '',
              purpose: 'public',
            },
            {
              ipam_address: '',
              label: 'testvlan',
              purpose: 'vlan',
            },
          ],
          region: 'us-east',
        },
      }),
      'creating a linode and getting its config'
    ).then(([linode, config]: [Linode, Config]) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
      interceptUpdateLinodeConfigs(linode.id, config.id).as('putLinodeConfigs');

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      cy.findByText('Edit').click();

      ui.dialog
        .findByTitle('Edit Configuration')
        .should('be.visible')
        .within(() => {
          cy.get('#ipam-input-1').type('192.0.2.0/25');
          ui.button
            .findByTitle('Save Changes')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@putLinodeConfigs').its('response.statusCode').should('eq', 200);

      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('eth0 – Public Internet');
        containsVisible('eth1 – VLAN: testvlan (192.0.2.0/25)');
      });
    });
  });

  it('Boots an existing config', () => {
    cy.defer(createAndBootLinode()).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);
      interceptRebootLinode(linode.id).as('rebootLinode');

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      cy.findByText('Boot').click();

      ui.dialog
        .findByTitle('Confirm Boot')
        .should('be.visible')
        .within(() => {
          containsVisible(
            'Are you sure you want to boot "My Debian 10 Disk Profile"?'
          );
          ui.button
            .findByTitle('Boot')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@rebootLinode').its('response.statusCode').should('eq', 200);

      ui.toast.assertMessage(
        'Successfully booted config My Debian 10 Disk Profile'
      );
      cy.findByText('REBOOTING').should('be.visible');
    });
  });

  it('Clones an existing config', () => {
    // Create a destination Linode to clone to
    // And delete the default config
    createLinode({
      label: 'cy-test-clone-destination-linode',
    }).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      ui.actionMenu
        .findByTitle('Action menu for Linode Config My Debian 10 Disk Profile')
        .should('be.visible')
        .click();
      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle('Confirm Delete')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Delete')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      ui.toast.assertMessage(
        'Configuration My Debian 10 Disk Profile – GRUB 2 successfully deleted'
      );
      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('No data to display.');
      });

      // Create a source Linode to clone from
      cy.defer(
        createLinodeAndGetConfig({
          waitForLinodeToBeRunning: true,
          linodeConfigRequestOverride: {
            label: 'cy-test-clone-origin-linode',
          },
        }),
        'creating a linode and getting its config'
      ).then(([linode, config]: [Linode, Config]) => {
        interceptDeleteLinodeConfig(linode.id, config.id).as(
          'deleteLinodeConfig'
        );
        cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

        // Add a sharable config to the source Linode
        cy.findByText('Add Configuration').click();
        ui.dialog
          .findByTitle('Add Configuration')
          .should('be.visible')
          .within(() => {
            cy.get('#label').type(`sharable-configuration`);
            ui.buttonGroup
              .findButtonByTitle('Add Configuration')
              .scrollIntoView()
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.findByLabelText('List of Configurations').within(() => {
          cy.get('tr').should('have.length', 2);
          containsVisible(
            `sharable-configuration – Latest 64 bit (6.2.9-x86_64-linode160)`
          );
          containsVisible('eth0 – Public Internet');
        });

        // Clone the thing
        ui.actionMenu
          .findByTitle('Action menu for Linode Config sharable-configuration')
          .should('be.visible')
          .click();
        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        cy.findByTestId('config-clone-selection-details')
          .should('be.visible')
          .within(() => {
            ui.button.findByTitle('Clone').should('be.disabled');
            cy.findByRole('combobox').should('be.visible').click();
            ui.select
              .findLinodeItemByText('cy-test-clone-destination-linode')
              .click();
            ui.button.findByTitle('Clone').should('be.enabled').click();
          });

        ui.toast.assertMessage(
          'Linode cy-test-clone-origin-linode successfully cloned to cy-test-clone-destination-linode.'
        );
      });
    });
  });

  it('Deletes an existing config', () => {
    cy.defer(
      createLinodeAndGetConfig({
        linodeConfigRequestOverride: {
          label: 'cy-test-delete-config-linode',
        },
      }),
      'creating a linode and getting its config'
    ).then(([linode, config]: [Linode, Config]) => {
      interceptDeleteLinodeConfig(linode.id, config.id).as(
        'deleteLinodeConfig'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      containsVisible('My Debian 10 Disk Profile – GRUB 2');
      ui.actionMenu
        .findByTitle('Action menu for Linode Config My Debian 10 Disk Profile')
        .should('be.visible')
        .click();
      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle('Confirm Delete')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Delete')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@deleteLinodeConfig')
        .its('response.statusCode')
        .should('eq', 200);
      ui.toast.assertMessage(
        'Configuration My Debian 10 Disk Profile – GRUB 2 successfully deleted'
      );
      cy.findByLabelText('List of Configurations').within(() => {
        containsVisible('No data to display.');
      });
    });
  });
});
