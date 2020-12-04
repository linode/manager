/* eslint-disable sonarjs/no-duplicate-string */
import { getClick, containsClick } from '../../support/helpers';
import 'cypress-file-upload';

describe('help & support', () => {
  it('open support ticket', () => {
    const image = 'test_screenshot.png';
    const imagePath = `images/${image}`;
    const ticketDescription = 'this is a test ticket';
    const ticketLabel = 'cy-test ticket';
    const ticketId = Math.floor(Math.random() * 99999999 + 10000000);
    const ts = new Date();

    cy.server();
    cy.route({
      method: 'GET',
      url: '*/profile'
    }).as('getProfile');

    cy.visitWithLogin('/support/tickets');
    cy.wait('@getProfile').then(xhr => {
      const user = xhr.response.body['username'];
      cy.route({
        method: 'POST',
        url: `*/support/tickets`,
        response: {
          attachments: [],
          closable: false,
          closed: null,
          description: 'this is a test ticket',
          entity: null,
          id: ticketId,
          opened: ts.toISOString(),
          opened_by: user,
          status: 'new',
          summary: 'cy-test ticket',
          updated: ts.toISOString(),
          updated_by: user
        }
      }).as('createTicket');
      cy.route({
        method: 'GET',
        url: `*/support/tickets/${ticketId}`,
        response: {
          attachments: [image],
          closable: false,
          closed: null,
          description: 'this is a test ticket',
          entity: null,
          id: ticketId,
          opened: ts.toISOString(),
          opened_by: user,
          status: 'new',
          summary: 'cy-test ticket',
          updated: ts.toISOString(),
          updated_by: user
        }
      }).as('getTicket');
      cy.route({
        method: 'GET',
        url: `*/support/tickets/${ticketId}/replies`,
        response: { data: [], page: 1, pages: 1, results: 0 }
      }).as('getReplies');
      cy.route({
        method: 'POST',
        url: `*/support/tickets/${ticketId}/attachments`,
        response: {}
      }).as('ticketNumberPost');

      containsClick('Open New Ticket');
      getClick('[placeholder="Enter a title for your ticket."]').type(
        ticketLabel
      );
      cy.get('[data-qa-enhanced-select="General/Account/Billing"]').should(
        'be.visible'
      );
      getClick('[data-qa-ticket-description="true"]').type(ticketDescription);
      cy.get('[id="attach-file"]').attachFile(imagePath);
      cy.get('[value="test_screenshot.png"]').should('be.visible');
      getClick('[data-qa-submit="true"]');

      cy.wait('@createTicket')
        .its('status')
        .should('eq', 200);
      cy.wait('@getTicket')
        .its('status')
        .should('eq', 200);
      cy.wait('@ticketNumberPost')
        .its('status')
        .should('eq', 200);
      cy.wait('@getReplies')
        .its('status')
        .should('eq', 200);

      cy.contains(`#${ticketId}: ${ticketLabel}`).should('be.visible');
      cy.contains(ticketDescription).should('be.visible');
      cy.contains(image).should('be.visible');
    });
  });
});
