/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode } from '../../support/api/linodes';
import { waitForAppLoad } from '../../support/ui/common';

describe('linode backups', () => {
  it('enable backups', () => {
    cy.visitWithLogin('/dashboard');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/backups/enable`
      }).as('enableBackups');
      waitForAppLoad();
      cy.visit(`/linodes/${linode.id}/backup`);
      cy.contains('Enable Backups')
        .should('be.visible')
        .click();
      cy.get('[data-qa-confirm-enable-backups="true"]')
        .should('be.visible')
        .click();
      cy.wait('@enableBackups');
      cy.findByText(`${linode.label}`).should('be.visible');
      cy.findByText('Automatic and manual backups will be listed here');
    });
  });

  it('enable backups', () => {
    cy.visitWithLogin('/dashboard');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/backups/enable`,
        response: {}
      }).as('enableBackups');
      cy.wait('@enableBackups');
      // test for creating snapshot, test for new linode from backup
      // cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
      // cy.findByText('Take Snapshot')
      //   .should('be.visible')
      //   .click();
      // cy.get('[data-qa-confirm="true"]')
      //   .should('be.visible')
      //   .click();
      // cy.findByText('Linode busy.').should('be.visible');
    });
  });
});
