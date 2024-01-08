import { createLinode } from 'support/api/linodes';
import { containsVisible, fbtVisible, fbltVisible } from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

authenticate();
describe('switch linode state', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

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
          cy.contains('Offline', { timeout: 300000 }).should('be.visible');
        });
    });
  });

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
      cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
    });
  });

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
          cy.contains('Running', { timeout: 300000 }).should('be.visible');
        });
    });
  });

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
