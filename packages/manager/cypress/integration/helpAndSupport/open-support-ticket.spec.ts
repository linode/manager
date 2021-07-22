/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-duplicate-string */
import {
  getClick,
  containsClick,
  getVisible,
  containsVisible,
} from '../../support/helpers';
import 'cypress-file-upload';

describe('help & support', () => {
  it('open support ticket', () => {
    const image = 'test_screenshot.png';
    const ticketDescription = 'this is a test ticket';
    const ticketLabel = 'cy-test ticket';
    const ticketId = Math.floor(Math.random() * 99999999 + 10000000);
    const ts = new Date();

    // intercept incoming response
    cy.intercept('GET', '*/profile').as('getProfile');

    cy.visitWithLogin('/support/tickets');
    cy.wait('@getProfile').then((xhr) => {
      const user = xhr.response?.body['username'];
      const mockTicketData = {
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
        updated_by: user,
      };
      // intercept create ticket request, stub response.
      cy.intercept('POST', '*/support/tickets', mockTicketData).as(
        'createTicket'
      );
      // stub incoming response
      cy.intercept('GET', `*/support/tickets/${ticketId}`, mockTicketData).as(
        'getTicket'
      );
      // intercept create support ticket request, stub response with 200
      cy.intercept(
        'POST',
        `*/support/tickets/${ticketId}/attachments`,
        (req) => {
          req.reply(200);
        }
      ).as('attachmentPost');
      // stub incoming response
      cy.intercept(`*/support/tickets/${ticketId}/replies`, {
        data: [],
        page: 1,
        pages: 1,
        results: 0,
      }).as('getReplies');

      containsClick('Open New Ticket');
      cy.get('input[placeholder="Enter a title for your ticket."]')
        .click({ scrollBehavior: false })
        .type(ticketLabel);
      getVisible('[data-qa-enhanced-select="General/Account/Billing"]');
      getClick('[data-qa-ticket-description="true"]').type(ticketDescription);
      cy.get('[id="attach-file"]').attachFile(image);
      getVisible('[value="test_screenshot.png"]');
      getClick('[data-qa-submit="true"]');

      cy.wait('@createTicket').its('response.statusCode').should('eq', 200);
      cy.wait('@attachmentPost').its('response.statusCode').should('eq', 200);
      cy.wait('@getReplies').its('response.statusCode').should('eq', 200);
      cy.wait('@getTicket').its('response.statusCode').should('eq', 200);

      containsVisible(`#${ticketId}: ${ticketLabel}`);
      containsVisible(ticketDescription);
      containsVisible(image);
    });
  });
});
