import { createLinode } from '../../support/api/linodes';
import { getClick, getVisible } from '../../support/helpers';

const deleteLinodeFromActionMenu = (linodeLabel) => {
  getClick(`[aria-label="Action menu for Linode ${linodeLabel}"]`);
  // the visible filter is to ignore all closed action menus
  cy.get(`[data-qa-action-menu-item="Delete"]`).filter(`:visible`).click();
  // There is 2 visible delete on the page, this is why i used this strategy
  cy.findAllByRole('button').filter(':contains("Delete")').click();
  cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
};

describe('linode landing', () => {
  it('deleting multiple linode with action menu', () => {
    // catch delete request
    cy.intercept('DELETE', '*/linode/instances/*').as('deleteLinode');
    createLinode().then((linodeA) => {
      createLinode().then((linodeB) => {
        cy.visitWithLogin('/linodes');
        getVisible('[data-qa-header="Linodes"]');
        cy.reload();
        getVisible('[data-qa-header="Linodes"]');
        deleteLinodeFromActionMenu(linodeA.label);
        // Here we used to have a bug fixed in
        // https://github.com/linode/manager/pull/6627
        // the second delete would crash the UI
        cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
        deleteLinodeFromActionMenu(linodeB.label);
      });
    });
  });
});
