/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode, clickLinodeActionMenu } from '../../support/api/linodes';

describe('delete linode', () => {
  it('deletes linode from linodes page', () => {
    cy.visitWithLogin('/linodes');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'DELETE',
        url: '*/linode/instances/*'
      }).as('deleteLinode');

      clickLinodeActionMenu(linode.label);

      // delete linode
      cy.get('[data-qa-action-menu-item="Delete"]:visible')
        .should('be.visible')
        .click();

      cy.findByText(linode.label).should('be.visible');

      cy.get('[data-qa-loading="false"]')
        .should('have.text', 'Delete')
        .should('be.visible')
        .click();

      // confirm delete
      cy.wait('@deleteLinode')
        .its('status')
        .should('eq', 200);
      cy.url().should('contain', '/linodes');
      cy.findByText(linode.label).should('not.be.visible');
    });
  });
  // will add a test for deleting from the dashboard here and maybe one for deleting from linode detail
});
