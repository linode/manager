import { Route } from '../support/api/routes';

describe('dashboard', () => {
  it('checks the dashboard page', () => {
    cy.visitWithLogin('/');
    cy.get('[data-qa-header]').should('have.text', 'Dashboard');
    cy.get('[data-qa-card="Linodes"] h2').should('have.text', 'Linodes');
    cy.get('[data-qa-card="Volumes"] h2').should('have.text', 'Volumes');
    cy.get('[data-qa-card="Domains"] h2').should('have.text', 'Domains');
    cy.get('[data-qa-card="NodeBalancers"] h2').should(
      'have.text',
      'NodeBalancers'
    );
  });
  it('checks load time and number of GET', () => {
    let xhrData = [];
    cy.wrap(xhrData).as('xhrData');
    cy.server({
      // Here we handle all requests passing through Cypress' server
      onRequest: req => {
        xhrData.push(req);
      }
    });
    cy.route({
      method: 'GET',
      url: '/v4/*'
    }).as('apiGet');

    const MAX_GET_REQ_TO_API = 8;

    cy.visitWithLogin('/');
    cy.get('[data-qa-header]').should('have.text', 'Dashboard');
    cy.get('[data-qa-card="Linodes"] h2').should('have.text', 'Linodes');
    cy.window().should('exist');

    cy.get('@xhrData')
      .its('length')
      .should('be.lte', MAX_GET_REQ_TO_API);
  });
  it('check Blog Feed', () => {
    cy.visitWithLogin('/');
    cy.get('[data-qa-card="Blog"]').should('be.visible');
    cy.get('[data-qa-blog-post]')
      .should('have.length.gte', 1)
      .each($e => {
        cy.wrap($e)
          .invoke('attr', 'href')
          .should('startWith', 'https://www.linode.com');
      });
  });
  describe('check we display', () => {
    const ERR_NO_ITEM_TO_DISPLAY = `No items to display.`;
    it(`"${ERR_NO_ITEM_TO_DISPLAY}" on no data`, () => {
      cy.server();
      Route.getLinodes({
        response: { data: [] }
      });
      cy.visitWithLogin('/');
      cy.get('[data-testid="table-row-empty"]').should(
        'contain',
        ERR_NO_ITEM_TO_DISPLAY
      );
    });
    const ERR_UNABLE_TO_LOAD_LINODES = `Unable to load Linodes.`;
    it(`"${ERR_UNABLE_TO_LOAD_LINODES}" on error from API`, () => {
      cy.server();
      Route.getLinodes({
        response: { errors: [{ reason: 'BAD' }], data: null }
      });
      cy.visitWithLogin('/');
      cy.findByText(ERR_UNABLE_TO_LOAD_LINODES).should('be.visible');
    });

    const ERR_AN_UNEXPECTED_ERROR = `An unexpected error occurred.`;
    // here we want to block the XHR get Linodes from returning,
    // but i have not found how to do this
    // https://github.com/cypress-io/cypress/issues/235
    it.skip(`"${ERR_AN_UNEXPECTED_ERROR}" on 503`, () => {
      Route.getLinodes();
      cy.visitWithLogin('/');
      cy.findByText(ERR_AN_UNEXPECTED_ERROR).should('be.visible');
    });
  });
});
