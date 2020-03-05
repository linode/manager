import { createLinode } from '../../support/api/linodes';
import { getLinodeLandingRow } from '../../support/ui/linodes';
import { defensiveDo } from '../../support/ui/common';

describe('delete linode', () => {
  beforeEach(() => {
    cy.login2();
  });
  it('deletes test nanode', () => {
    cy.visit('/linodes');
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'DELETE',
        url: '*/linode/instances/*'
      }).as('deleteLinode');

      /** Here we cannot factorize the result of the selector
       *  in a variable as this is a chain of action and not an element
       *  Solution is to write the selector as a function if we want to factorize code
       */
      getLinodeLandingRow(linode.label).click();

      cy.url().should('contain', '/summary');
      cy.findByText(linode.label).should('exist');

      // it looks like there is 4 ReRender of 'Settings'
      // This code makes it more reliable
      // I tested this with
      //    * attempts 2, initial wait 0, between run wait 0: [0,0 + dt] fails
      //    * attempts 1, initial wait 300, between run wait 0: [300] ok
      //    * attempts 2, initial wait 0, between run wait 100: [0, 100 + dt] fails
      //    * attempts 2, initial wait 0, between run wait 300: [0, 300 + dt] fails
      //    * attempts 3, initial wait 0, between run wait 300: [0, 300 + dt, 600 + 2*dt] ok
      //Default: attempts 3, initial wait 200, between run wait 200: [0, 200 + dt, 400 + 2*dt]
      defensiveDo(() =>
        cy
          .findByText('Settings')
          .should('be.visible')
          .click()
      );

      cy.findByText('Delete Linode').click();

      // here i query using text to check the UI and there is only 1 Delete button
      // cy.get('[data-qa-delete-linode]').click();
      cy.findByText('Delete').click();
      cy.findByText(linode.label).should('exist');

      // confirm delete
      // there is now 2 delete on the page so i use the attribute selector
      // cy.findByText('Delete').debug()
      cy.get('[data-qa-confirm-delete]').click();

      // Here if the request is against a local route
      // this is because we use a proxy in webpack config
      // this redirects localhost:3000/api to api.linode.com/api
      // Thanks to this we can use cy.server, cy.route and cy.wait
      cy.wait('@deleteLinode')
        .its('status')
        .should('be', 200);
      cy.url().should('contain', '/linodes');
      cy.go('back');
      cy.findByText('Not found');
    });
  });
});
