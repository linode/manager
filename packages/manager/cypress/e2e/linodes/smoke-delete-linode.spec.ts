/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode } from 'support/api/linodes';
import { containsClick, fbtVisible, getVisible } from 'support/helpers';
import { ui } from 'support/ui';

describe('delete linode', () => {
  it('deletes linode from linode details page', () => {
    createLinode().then((linode) => {
      // catch delete request
      cy.intercept('DELETE', '*/linode/instances/*').as('deleteLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // delete linode
      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      fbtVisible(linode.label);
      getVisible('[type="button"]').within(() => {
        containsClick('Delete Linode');
      });

      // confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      cy.url().should('contain', '/linodes');
      cy.findByText(linode.label).should('not.exist');
    });
  });
  // will add a test for deleting from the dashboard here and maybe one for deleting from linode landing
});
