/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinode,
  deleteLinodeById,
  RequestType
} from '../../support/api/linodes';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick
} from '../../support/helpers';
import { assertToast } from '../../support/ui/events';

describe('linode backups', () => {
  it('enable backups', () => {
    createLinode().then(linode => {
      cy.visitWithLogin(`/dashboard`);
      // intercept request
      cy.intercept('POST', `*/linode/instances/${linode.id}/backups/enable`).as(
        'enableBackups'
      );
      // intercept response
      cy.intercept('*/account/settings').as('getSettings');
      cy.visit(`/linodes/${linode.id}/backup`);
      // if account is managed, test will pass but skip enabling backups
      containsVisible(`${linode.label}`);
      cy.wait('@getSettings').then(xhr => {
        const response = xhr.response?.body;
        const managed: boolean = response['managed'];
        if (!managed) {
          containsClick('Enable Backups');
          getClick('[data-qa-confirm-enable-backups="true"]');
          cy.wait('@enableBackups');
        }
      });
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        fbtVisible('Automatic and manual backups will be listed here');
      }
      deleteLinodeById(linode.id);
    });
  });

  it('create linode from snapshot', () => {
    cy.visitWithLogin('/dashboard');
    createLinode(RequestType.BACKUP, true).then(linode => {
      cy.visit(`/linodes/${linode.id}/backup`);
      // intercept request
      cy.intercept('POST', `*/linode/instances/${linode.id}/backups`).as(
        'enableBackups'
      );
      fbtVisible(`${linode.label}`);
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
        fbtClick('Take Snapshot');
        getClick('[data-qa-confirm="true"]');
      }
      if (!cy.findByText('Linode busy.').should('not.exist')) {
        getClick('[data-qa-confirm="true"]');
      }
      cy.wait('@enableBackups')
        .its('response.statusCode')
        .should('eq', 200);
      assertToast('A snapshot is being taken');
      deleteLinodeById(linode.id);
    });
  });

  // this test has become irrelevant for now
  it.skip('cant snapshot while booting linode', () => {
    cy.visitWithLogin('/dashboard');
    createLinode(RequestType.BACKUP, true).then(linode => {
      cy.visit(`/linodes/${linode.id}/backup`);
      fbtClick('Take Snapshot');
      cy.findByText('Label is required.');
      cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
      fbtClick('Take Snapshot');
      getClick('[data-qa-confirm="true"]');
      containsVisible('Linode busy.');
      deleteLinodeById(linode.id);
    });
  });
});
