import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import type { Linode } from '@linode/api-v4';

authenticate();
describe('switch linode state', () => {
  before(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');
  });

  /*
   * - Confirms that a Linode can be shut down from the Linodes landing page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that landing page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish being shut down before succeeding.
   */
  it('powers off a linode from landing page', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to reboot shortly after booting up when the Linode is
    // attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode: Linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.contains('Running', { timeout: LINODE_CREATE_TIMEOUT }).should(
            'be.visible'
          );
        });

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Power Off').should('be.visible').click();

      ui.dialog
        .findByTitle(`Power Off Linode ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Power Off Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.contains('Shutting Down').should('be.visible');
        });
    });
  });

  /*
   * - Confirms that a Linode can be shut down from its details page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that details page UI updates to reflect Linode power state.
   * - Waits for Linode to fully shut down before succeeding.
   */
  it('powers off a linode from details page', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to reboot shortly after booting up when the Linode is
    // attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );
      cy.findByText(linode.label).should('be.visible');

      cy.findByText('Power Off').should('be.visible').click();
      ui.dialog
        .findByTitle(`Power Off Linode ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Power Off Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
      cy.contains('SHUTTING DOWN').should('be.visible');
      cy.contains('OFFLINE', { timeout: 300000 }).should('be.visible');
    });
  });

  /*
   * - Confirms that a Linode can be booted from the Linode landing page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that landing page UI updates to reflect Linode power state.
   * - Waits for Linode to finish booting up before succeeding.
   */
  it('powers on a linode from landing page', () => {
    cy.defer(() => createTestLinode({ booted: false })).then(
      (linode: Linode) => {
        cy.visitWithLogin('/linodes');
        cy.get(`[data-qa-linode="${linode.label}"]`)
          .should('be.visible')
          .within(() => {
            cy.contains('Offline', { timeout: LINODE_CREATE_TIMEOUT }).should(
              'be.visible'
            );
          });

        ui.actionMenu
          .findByTitle(`Action menu for Linode ${linode.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Power On').should('be.visible').click();

        ui.dialog
          .findByTitle(`Power On Linode ${linode.label}?`)
          .should('be.visible')
          .within(() => {
            ui.button
              .findByTitle('Power On Linode')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.get(`[data-qa-linode="${linode.label}"]`)
          .should('be.visible')
          .within(() => {
            cy.contains('Booting').should('be.visible');
            cy.contains('Running', { timeout: LINODE_CREATE_TIMEOUT }).should(
              'be.visible'
            );
          });
      }
    );
  });

  /*
   * - Confirms that a Linode can be booted from its details page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that details page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish booting up before succeeding.
   */
  it('powers on a linode from details page', () => {
    cy.defer(() => createTestLinode({ booted: false })).then(
      (linode: Linode) => {
        cy.visitWithLogin(`/linodes/${linode.id}`);
        cy.contains('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
          'be.visible'
        );
        cy.findByText(linode.label).should('be.visible');

        cy.findByText('Power On').should('be.visible').click();
        ui.dialog
          .findByTitle(`Power On Linode ${linode.label}?`)
          .should('be.visible')
          .within(() => {
            ui.button
              .findByTitle('Power On Linode')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.contains('BOOTING').should('be.visible');
      }
    );
  });

  /*
   * - Confirms that a Linode can be rebooted from the Linode landing page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that landing page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish rebooting before succeeding.
   */
  it('reboots a linode from landing page', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to reboot shortly after booting up when the Linode is
    // attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode: Linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.contains('Running', { timeout: LINODE_CREATE_TIMEOUT }).should(
            'be.visible'
          );
        });

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Reboot').should('be.visible').click();

      ui.dialog
        .findByTitle(`Reboot Linode ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Reboot Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.contains('Rebooting').should('be.visible');
        });
    });
  });

  /*
   * - Confirms that a Linode can be rebooted from its details page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that details page UI updates to reflect Linode power state.
   * - Waits for Linode to finish rebooting before succeeding.
   */
  it('reboots a linode from details page', () => {
    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to reboot shortly after booting up when the Linode is
    // attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode({ booted: true }, { securityMethod: 'vlan_no_internet' })
    ).then((linode: Linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );
      cy.findByText(linode.label).should('be.visible');

      cy.findByText('Reboot').should('be.visible').click();
      ui.dialog
        .findByTitle(`Reboot Linode ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          ui.button
            .findByTitle('Reboot Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });
      cy.contains('REBOOTING').should('be.visible');
      cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
    });
  });
});
