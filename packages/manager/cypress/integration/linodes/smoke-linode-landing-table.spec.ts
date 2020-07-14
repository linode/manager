import { createLinode } from '../../support/api/linodes';

const deleteLinodeFromActionMenu = linodeLabel => {
  cy.findAllByLabelText(`Action menu for Linode ${linodeLabel}`).click();
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
};

describe('linode landing', () => {
  it('deleting multiple linode with action menu', () => {
    cy.server();
    cy.route({
      url: '*/linode/instances/*',
      method: 'DELETE'
    }).as('deleteLinode');
    cy.visitWithLogin('/linodes');
    createLinode().then(linodeA => {
      createLinode().then(linodeB => {
        deleteLinodeFromActionMenu(linodeA.label);
        // Here we used to have a bug fixed in
        // https://github.com/linode/manager/pull/6627
        // the second delete would crash the UI
        cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.be.visible');
        deleteLinodeFromActionMenu(linodeB.label);
      });
    });
  });
});
