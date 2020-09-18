/* eslint-disable sonarjs/no-duplicate-string */
import { getVisibleClick, containsVisibleClick } from '../../support/helpers';
import 'cypress-file-upload';
import { deleteAllTestTickets } from '../../support/api/helpAndSupport';

describe('help & support', () => {
  it('open support ticket', () => {
    const image = 'test_screenshot.png';
    const imagePath = `images/${image}`;
    const ticketDescription = 'this is a test ticket';
    const ticketLabel = 'cy-test ticket';
    cy.server();
    cy.route({
      method: 'POST',
      url: `*/support/tickets`
    }).as('createTicket');
    cy.route({
      method: 'POST',
      url: `*/support/tickets/*/attachments`
    }).as('ticketNumberPost');
    cy.visitWithLogin('/support/tickets');
    containsVisibleClick('Open New Ticket');
    getVisibleClick('[placeholder="Enter a title for your ticket."]').type(
      ticketLabel
    );
    cy.get('[data-qa-enhanced-select="General/Account/Billing"]').should(
      'be.visible'
    );
    getVisibleClick('[data-qa-ticket-description="true"]').type(
      ticketDescription
    );
    cy.get('[id="attach-file"]').attachFile(imagePath);
    cy.get('[value="test_screenshot.png"]').should('be.visible');
    getVisibleClick('[data-qa-submit="true"]');
    cy.wait('@createTicket')
      .its('status')
      .should('eq', 200);
    cy.wait('@ticketNumberPost').then(xhr => {
      const fullUrl = xhr.url.split('/');
      const ticketId = fullUrl[fullUrl.length - 2];
      cy.contains(`#${ticketId}: ${ticketLabel}`).should('be.visible');
    });
    cy.contains(ticketDescription).should('be.visible');
    cy.contains(image).should('be.visible');
    deleteAllTestTickets();
  });
});
