/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode, deleteLinodeById } from 'support/api/linodes';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from 'support/helpers';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';

describe('linode backups', () => {
  it('enable backups', () => {
    createLinode().then((linode) => {
      cy.visitWithLogin(`/dashboard`);
      // intercept request
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/backups/enable`)
      ).as('enableBackups');
      // intercept response
      cy.intercept(apiMatcher('account/settings')).as('getSettings');
      cy.visit(`/linodes/${linode.id}/backup`);
      // if account is managed, test will pass but skip enabling backups
      containsVisible(`${linode.label}`);
      cy.wait('@getSettings').then((xhr) => {
        const response = xhr.response?.body;
        const managed: boolean = response['managed'];
        if (!managed) {
          containsClick('Enable Backups');
          getClick('[data-qa-confirm-enable-backups="true"]');
          cy.wait('@enableBackups');
        }
      });
      if (
        // TODO Resolve potential flake.
        // If Cloud Manager loads slowly (e.g. due to slow API requests, network issues, etc.),
        // it is possible to load the Linode details page after it has finished booting. In those
        // cases, Cypress will never find the `PROVISIONING` status indicator and the test will fail.
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        containsVisible('Automatic and manual backups will be listed here');
      }
      deleteLinodeById(linode.id);
    });
  });

  it('create linode from snapshot', () => {
    cy.visitWithLogin('/dashboard');
    createLinode({ backups_enabled: true }).then((linode) => {
      cy.visit(`/linodes/${linode.id}/backup`);
      // intercept request
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/backups`)
      ).as('enableBackups');
      fbtVisible(`${linode.label}`);
      if (
        // TODO Resolve potential flake.
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
        fbtClick('Take Snapshot');
        getClick('[data-qa-confirm="true"]');
      }
      if (!cy.contains('Linode busy.').should('not.exist')) {
        getClick('[data-qa-confirm="true"]');
      }
      cy.wait('@enableBackups').its('response.statusCode').should('eq', 200);
      ui.toast.assertMessage('A snapshot is being taken');
      deleteLinodeById(linode.id);
    });
  });

  // this test has become irrelevant for now
  it.skip('cant snapshot while booting linode', () => {
    cy.visitWithLogin('/dashboard');
    createLinode({ backups_enabled: true }).then((linode) => {
      cy.visit(`/linodes/${linode.id}/backup`);
      fbtClick('Take Snapshot');
      cy.contains('Label is required.');
      cy.get('[data-qa-manual-name="true"]').type(`${linode.label} backup`);
      fbtClick('Take Snapshot');
      getClick('[data-qa-confirm="true"]');
      containsVisible('Linode busy.');
    });
  });
});
