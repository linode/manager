import { createLinode } from 'support/api/linodes';
import { containsVisible, fbtVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

authenticate();
describe('switch linode state', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

  /*
   * - Confirms that a Linode can be shut down from the Linodes landing page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that landing page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish being shut down before succeeding.
   */
  it('powers off a linode from landing page', () => {
    createLinode().then((linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          containsVisible('Running');
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
          containsVisible('Shutting Down');
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
    createLinode().then((linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('RUNNING');
      fbtVisible(linode.label);

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
      containsVisible('SHUTTING DOWN');
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
    createLinode({ booted: false }).then((linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          containsVisible('Offline');
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
          containsVisible('Booting');
          cy.contains('Running', { timeout: 300000 }).should('be.visible');
        });
    });
  });

  /*
   * - Confirms that a Linode can be booted from its details page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that details page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish booting up before succeeding.
   */
  it('powers on a linode from details page', () => {
    createLinode({ booted: false }).then((linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('OFFLINE');
      fbtVisible(linode.label);

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
      containsVisible('BOOTING');
    });
  });

  /*
   * - Confirms that a Linode can be rebooted from the Linode landing page.
   * - Confirms flow end-to-end using real API requests.
   * - Confirms that landing page UI updates to reflect Linode power state.
   * - Does not wait for Linode to finish rebooting before succeeding.
   */
  it('reboots a linode from landing page', () => {
    createLinode().then((linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          containsVisible('Running');
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
          containsVisible('Rebooting');
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
    createLinode().then((linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('RUNNING');
      fbtVisible(linode.label);

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
      containsVisible('REBOOTING');
      cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
    });
  });
});
