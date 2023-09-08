import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { interceptRebootLinode } from 'support/intercepts/linodes';
import { createAndBootLinode } from './linode-utils';
import type { Linode } from '@linode/api-v4';

authenticate();

describe('Linode cConfig', () => {
  before(() => {
    cleanUp('linodes');
  });

  it('Creates a new config', () => {
    createLinode().then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

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

      cy.get(`[aria-label="List of Configurations"]`).within(() => {
        containsVisible(
          `${linode.id}-test-config – Latest 64 bit (6.2.9-x86_64-linode160)`
        );
        containsVisible('eth0 – Public Internet');
      });
    });
  });

  it('Edits an existing config', () => {
    createLinode({
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
    }).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}/configurations`);

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

      cy.get(`[aria-label="List of Configurations"]`).within(() => {
        containsVisible('eth0 – Public Internet');
        containsVisible('eth1 – VLAN: testvlan (192.0.2.0/25)');
      });
    });
  });

  it.only('Boots an existing config', () => {
    cy.defer(createAndBootLinode(), 'creating and booting Linode').then(
      (linode: Linode) => {
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
      }
    );
  });
});
