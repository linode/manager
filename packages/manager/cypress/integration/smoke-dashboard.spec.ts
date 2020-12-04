import { Route } from '../support/api/routes';
import { createLinode, deleteAllTestLinodes } from '../support/api/linodes';

describe('dashboard', () => {
  it('checks the dashboard page with 2+ linodes', () => {
    createLinode().then(() => {
      createLinode().then(() => {
        cy.visitWithLogin('/');
        cy.get('[data-qa-add-new-menu-button="true"]').should('be.visible');
        cy.findByLabelText('Main search').should('be.visible');
        cy.get('[aria-label="Notifications"]').should('be.visible');
        cy.get('[data-qa-loading="true"]').should('be.visible');
        deleteAllTestLinodes();
      });
    });
  });

  it.skip('caps page load time and GET requests', () => {
    const MAX_GET_REQ_TO_API = 4;
    const xhrData: any = [];
    cy.wrap(xhrData).as('xhrData');
    cy.server({
      // Here we handle all requests passing through Cypress' server
      onRequest: req => {
        xhrData.push(req);
      }
    });
    cy.route({
      method: 'GET',
      url: '/v4/**'
    }).as('apiGet');

    cy.visitWithLogin('/');
    cy.window({ timeout: 5000 });

    cy.get('@xhrData')
      .its('length')
      .should('be.lte', MAX_GET_REQ_TO_API);
  });

  it.skip('Verify correct error message when unable to get linodes', () => {
    Route.getLinodes({
      response: 'error'
    });
    cy.visitWithLogin('/');
    cy.wait('@getLinodes');
    cy.findByText('Error loading Linodes').should('be.visible');
  });
});
