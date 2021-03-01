import { Route } from '../support/api/routes';
import { createLinode, deleteAllTestLinodes } from '../support/api/linodes';
import { fbtVisible, getVisible } from '../support/helpers';

describe('dashboard', () => {
  it('checks the dashboard page with 2+ linodes', () => {
    cy.intercept('GET', '*/profile/preferences').as('getPreferences');
    createLinode().then(() => {
      createLinode().then(() => {
        cy.visitWithLogin('/');
        cy.wait('@getPreferences');
        getVisible('[data-qa-add-new-menu-button="true"]');
        fbtVisible('Main search');
        getVisible('[aria-label="Notifications"]');
        deleteAllTestLinodes();
      });
    });
  });

  it.skip('caps page load time and GET requests', () => {
    const MAX_GET_REQ_TO_API = 4;
    const xhrData: any = [];
    cy.wrap(xhrData).as('xhrData');
    cy.server();
    cy.route({
      // Here we handle all requests passing through Cypress' server
      onRequest: (req) => {
        xhrData.push(req);
      },
    });
    cy.route('/v4/**').as('apiGet');

    cy.visitWithLogin('/');
    cy.window({ timeout: 5000 });

    cy.get('@xhrData')
      .its('length')
      .should('be.lte', MAX_GET_REQ_TO_API);
  });

  it.skip('Verify correct error message when unable to get linodes', () => {
    Route.getLinodes({
      response: 'error',
    });
    cy.visitWithLogin('/');
    cy.wait('@getLinodes');
    fbtVisible('Error loading Linodes');
  });
});
