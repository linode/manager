/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinode,
  createLinodeWithBackupsEnabled
} from '../../support/api/linodes';
import { waitForAppLoad } from '../../support/ui/common';

describe('linode backups', () => {
  it.skip('enable backups', () => {
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

  it.skip('cant snapshot while booting linode', () => {
    cy.visitWithLogin('/dashboard');
    createLinodeWithBackupsEnabled().then(linode => {
      cy.visit(`/linodes/${linode.id}/backup`);
      cy.findByText('Take Snapshot')
        .should('be.visible')
        .click();
      cy.findByText('Label is required.');
      cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
      cy.findByText('Take Snapshot')
        .should('be.visible')
        .click();
      cy.get('[data-qa-confirm="true"]')
        .should('be.visible')
        .click();
      cy.contains('Linode busy.').should('be.visible');
    });
  });

  // it('create linode from snapshot', () => {
  //   cy.visitWithLogin('/dashboard');
  //   createLinodeWithBackupsEnabled().then(linode => {
  //     cy.visit(`/linodes/${linode.id}/backup`);
  //     cy.server();
  //     cy.route({
  //       method: 'POST',
  //       url: `*/linode/instances/${linode.id}/backups`,
  //       response: {}
  //     }).as('enableBackups');
  //     cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
  //     cy.findByText('Take Snapshot')
  //       .should('be.visible')
  //       .click();
  //     cy.get('[data-qa-confirm="true"]')
  //       .should('be.visible')
  //       .click();
  //   });
  // });
});
