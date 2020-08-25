import { Route } from '../support/api/routes';
import { createLinode, deleteAllTestLinodes } from '../support/api/linodes';

describe('dashboard', () => {
  it('checks the dashboard page with 2+ linodes', () => {
    createLinode().then(() => {
      createLinode().then(() => {
        cy.visitWithLogin('/');
        cy.get('[data-qa-add-new-menu-button="true"]').should('be.visible');
        cy.findByLabelText('Main search').should('be.visible');
        cy.get('[aria-label="Click to view notifications drawer"]').should(
          'be.visible'
        );
        cy.findByText('Make a payment').should('be.visible');
        cy.findByText('Uninvoiced Charges*').should('be.visible');
        cy.findByText('Payment & Credits').should('be.visible');
        cy.findByText('Next Cycle Estimated Balance*').should('be.visible');
        cy.findByText('Pending Actions').should('be.visible');
        cy.findByText('View history').should('be.visible');
        cy.findByText('Open Support Tickets').should('be.visible');
        cy.findByText('View all tickets').should('be.visible');
        cy.findByText('Community Updates').should('be.visible');
        cy.findByText('Visit the Community').should('be.visible');
        cy.findByText('System Status').should('be.visible');
        cy.findByText('View fleet status').should('be.visible');
        cy.get('[data-qa-loading="true"]').should('be.visible');
        cy.get('[data-qa-tp]').should('be.visible');
        cy.findByText('Docs').should('be.visible');
        deleteAllTestLinodes();
      });
    });
  });

  it('caps page load time and GET requests', () => {
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

  it('Verify correct error message when unable to get linodes', () => {
    Route.getLinodes({
      response: 'error'
    });
    cy.visitWithLogin('/');
    cy.wait('@getLinodes');
    cy.findByText('Error loading Linodes').should('be.visible');
  });
});
