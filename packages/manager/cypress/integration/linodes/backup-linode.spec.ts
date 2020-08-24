import { createLinode } from '../../support/api/linodes';

describe('linode backups', () => {
  it('create basic backup', () => {
    cy.visitWithLogin('/dashboard');
    cy.server();
    cy.route({
      method: 'POST',
      url: '*/linodes/*/backups/enable'
    }).as('enableBackups');
    createLinode().then(linode => {
      cy.visit(`/${linode.id}/backup`);
      cy.findByText('Enable Backups')
        .should('be.visible')
        .click();
      cy.findByText('Enable Backups')
        .should('be.visible')
        .click();
      cy.wait('@enableBackups');
      cy.get('[data-qa-manual-name="true"]').type(`${linode.name} backup`);
      cy.findByText('Take Snapshot').click();
      cy.findByText('Take Snapshot').click();
    });
  });
});
