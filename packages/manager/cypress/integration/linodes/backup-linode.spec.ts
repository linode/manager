/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinode,
  createLinodeWithBackupsEnabled,
  deleteLinodeById
} from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';

describe('linode backups', () => {
  it('enable backups', () => {
    createLinode().then(linode => {
      cy.visitWithLogin(`/dashboard`);
      cy.server();
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/backups/enable`
      }).as('enableBackups');
      cy.route({
        method: 'GET',
        url: `*/account/settings`
      }).as('getSettings');
      cy.contains(`${linode.label}`).should('be.visible');
      cy.visit(`/linodes/${linode.id}/backup`);
      // if account is managed, test will pass but skip enabling backups
      cy.wait('@getSettings').then(xhr => {
        const response = xhr.response.body;
        const managed: boolean = response['managed'];
        cy.contains(`${linode.label}`).should('be.visible');
        if (!managed) {
          cy.contains('Enable Backups')
            .should('be.visible')
            .click();
          cy.get('[data-qa-confirm-enable-backups="true"]')
            .should('be.visible')
            .click();
          cy.wait('@enableBackups');
        }
      });
      cy.findByText(`${linode.label}`).should('be.visible');
      cy.findByText('Automatic and manual backups will be listed here');
      deleteLinodeById(linode.id);
    });
  });

  it('cant snapshot while booting linode', () => {
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

  it('create linode from snapshot', () => {
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
