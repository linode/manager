/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode, clickLinodeActionMenu } from '../../support/api/linodes';
import { containsClick, fbtVisible, getVisible } from '../../support/helpers';

describe('delete linode', () => {
  it('deletes linode from linodes page', () => {
    createLinode().then((linode) => {
      // catch delete request
      cy.intercept('DELETE', '*/linode/instances/*').as('deleteLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      clickLinodeActionMenu(linode.label);
      // delete linode
      cy.get('[data-qa-action-menu-item="Delete"]:visible')
        .should('be.visible')
        .click();

      fbtVisible(linode.label);
      getVisible('[type="button"]').within(() => {
        containsClick('Delete Linode');
      });
      // cy.get('[data-qa-loading="false"]').should('have.text', 'Delete').click();

      // confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      cy.url().should('contain', '/linodes');
      cy.findByText(linode.label).should('not.exist');
    });
  });
  // will add a test for deleting from the dashboard here and maybe one for deleting from linode detail
});
