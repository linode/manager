/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinode,
  createLinodeWithBackupsEnabled,
  deleteLinodeById
} from '../../support/api/linodes';
import { waitForAppLoad } from '../../support/ui/common';
import { assertToast } from '../../support/ui/events';

describe('linode backups', () => {
  it('enable backups', () => {
    createLinode().then(linode => {
      cy.server();
      cy.route('*/account/settings', [
        { managed: false, backups_enabled: false }
      ]).as('mockNonManaged');
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/backups/enable`
      }).as('enableBackups');
      cy.visitWithLogin(`/linodes/${linode.id}/backup`);
      cy.wait('@mockNonManaged');
      if (cy.contains('Enable Backups').should('be.visible')) {
        cy.contains('Enable Backups')
          .should('be.visible')
          .click();
        cy.get('[data-qa-confirm-enable-backups="true"]')
          .should('be.visible')
          .click();
        cy.wait('@enableBackups');
      }
      // cy.visit(`/linodes/${linode.id}/backup`);
      // cy.wait('@mockNonManaged');
      cy.findByText(`${linode.label}`).should('be.visible');
      cy.findByText('Automatic and manual backups will be listed here');
      deleteLinodeById(linode.id);
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
      deleteLinodeById(linode.id);
    });
  });

  it.skip('create linode from snapshot', () => {
    cy.visitWithLogin('/dashboard');
    createLinodeWithBackupsEnabled().then(linode => {
      cy.visit(`/linodes/${linode.id}/backup`);
      cy.server();
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/backups`
      }).as('enableBackups');
      cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
      if (
        cy.contains('Provisioning').should('not.be.visible') &&
        cy.contains('Booting').should('not.be.visible')
      ) {
        cy.findByText('Take Snapshot')
          .should('be.visible')
          .click();
        cy.get('[data-qa-confirm="true"]')
          .should('be.visible')
          .click();
      }
      if (!cy.findByText('Linode busy.').should('not.be.visible')) {
        cy.get('[data-qa-confirm="true"]')
          .should('be.visible')
          .click();
      }
      cy.wait('@enableBackups')
        .its('status')
        .should('eq', 200);
      assertToast('A snapshot is being taken');
      deleteLinodeById(linode.id);
    });
  });
});
