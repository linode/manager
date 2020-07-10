import { createLinode } from '../../support/api/linodes';

describe('linode landing', () => {
  it('delete linode with action menu', () => {
    createLinode().then(linode => {
      cy.server();
      cy.route({
        url: '*/linode/instances/*',
        method: 'DELETE'
      }).as('deleteLinode');
      cy.visitWithLogin('/linodes');
      cy.findAllByLabelText(`Action menu for Linode ${linode.label}`).click();
      // the visible filter is to ignore all closed action menus
      cy.get(`[data-qa-action-menu-item="Delete"]`)
        .filter(`:visible`)
        .click();
      // There is 2 visible delete on the page, this is why i used this strategy
      cy.findAllByRole('button')
        .filter(':contains("Delete")')
        .click();
      cy.wait('@deleteLinode')
        .its('status')
        .should('eq', 200);
    });
  });
});
