import { createLinode } from 'support/api/linodes';
import { containsVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('edit linode config', () => {
  before(() => {
    cleanUp('linodes');
  });

  it('edits an existing config successfully', () => {
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
    }).then((linode) => {
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

  it.only('creates a new config successfully', () => {
    createLinode().then((linode) => {
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
});
