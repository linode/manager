import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  interceptRebootLinode,
  interceptCloneLinode,
} from 'support/intercepts/linodes';
import {
  interceptDeleteLinodeConfig,
  interceptPostLinodeConfigs,
  interceptPutLinodeConfigs,
} from 'support/intercepts/configs';
import { createAndBootLinode, createLinodeAndGetConfig } from './linode-utils';

import type { Config, Linode } from '@linode/api-v4';

authenticate();

describe('Linode Config', () => {
  before(() => {
    cleanUp(['linodes']);
  });

  it('Creates a new config and list all configs', () => {
    createLinode().then((linode: Linode) => {
      interceptPostLinodeConfigs(linode.id).as('postLinodeConfigs');

      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

      cy.get(`[aria-label="List of Configurations"]`).within(() => {
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

      cy.get(`[aria-label="List of Configurations"]`).within(() => {
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
      interceptPutLinodeConfigs(linode.id, config.id).as('putLinodeConfigs');

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

      cy.get(`[aria-label="List of Configurations"]`).within(() => {
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

  it.skip('Clones an existing config', () => {
    // This is a niche feature seems to actually clone the Linode, not the config, but only under certain circumstances
    // In the absence of API documentation, we're skipping this test for now.
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
      ui.toast.assertMessage('Successfully deleted config');
      cy.get(`[aria-label="List of Configurations"]`).within(() => {
        containsVisible('No data to display.');
      });
    });
  });
});
