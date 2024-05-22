/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-duplicate-string */
import {
  getClick,
  containsClick,
  getVisible,
  containsVisible,
} from 'support/helpers';
import 'cypress-file-upload';
import { interceptGetProfile } from 'support/intercepts/profile';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';
import {
  randomItem,
  randomLabel,
  randomNumber,
  randomPhrase,
} from 'support/util/random';
import { supportTicketFactory } from 'src/factories';
import {
  mockAttachSupportTicketFile,
  mockCreateSupportTicket,
  mockGetSupportTicket,
  mockGetSupportTickets,
  mockGetSupportTicketReplies,
} from 'support/intercepts/support';
import { severityLabelMap } from 'src/features/Support/SupportTickets/ticketUtils';

describe('help & support', () => {
  /*
   * - Opens a Help & Support ticket using mock API data.
   * - Confirms that "Severity" field is not present when feature flag is disabled.
   */
  it('open support ticket', () => {
    mockAppendFeatureFlags({
      supportTicketSeverity: makeFeatureFlagData(false),
    });
    mockGetFeatureFlagClientstream();

    const image = 'test_screenshot.png';
    const ticketDescription = 'this is a test ticket';
    const ticketLabel = 'cy-test ticket';
    const ticketId = Math.floor(Math.random() * 99999999 + 10000000);
    const ts = new Date();

    interceptGetProfile().as('getProfile');

    cy.visitWithLogin('/support/tickets');

    // Confirm that "Severity" table column is not shown.
    cy.get('[data-qa-open-tickets-tab]').within(() => {
      cy.findByLabelText('Sort by severity').should('not.exist');
    });

    cy.wait('@getProfile').then((xhr) => {
      const user = xhr.response?.body['username'];
      const mockTicketData = supportTicketFactory.build({
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
      });

      // intercept create ticket request, stub response.
      mockCreateSupportTicket(mockTicketData).as('createTicket');
      mockGetSupportTicketReplies(ticketId, []).as('getReplies');
      mockAttachSupportTicketFile(ticketId).as('attachmentPost');

      containsClick('Open New Ticket');
      cy.get('input[placeholder="Enter a title for your ticket."]')
        .click({ scrollBehavior: false })
        .type(ticketLabel);
      cy.findByLabelText('Severity').should('not.exist');
      getClick('[data-qa-ticket-entity-type]');
      containsVisible('General/Account/Billing');
      getClick('[data-qa-ticket-description="true"]').type(ticketDescription);
      cy.get('[id="attach-file"]').attachFile(image);
      getVisible('[value="test_screenshot.png"]');
      getClick('[data-qa-submit="true"]');

      cy.wait('@createTicket').its('response.statusCode').should('eq', 200);
      cy.wait('@attachmentPost').its('response.statusCode').should('eq', 200);
      cy.wait('@getReplies').its('response.statusCode').should('eq', 200);

      containsVisible(`#${ticketId}: ${ticketLabel}`);
      containsVisible(ticketDescription);
      containsVisible(image);
    });
  });

  /*
   * - Opens a Help & Support ticket with a severity level specified using mock API data.
   * - Confirms that outgoing API request includes the expected severity level in its payload.
   * - Confirms that specified severity level is displayed on the created ticket.
   */
  it('can create a ticket with a severity level specified', () => {
    // TODO Integrate this test with the above test when feature flag goes away.
    const mockTicket = supportTicketFactory.build({
      id: randomNumber(),
      summary: randomLabel(),
      description: randomPhrase(),
      severity: randomItem([1, 2, 3]),
      status: 'new',
    });

    // Get severity label for numeric severity level.
    // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
    const severityLabel = severityLabelMap.get(mockTicket.severity!);
    if (!severityLabel) {
      throw new Error(
        `Unable to retrieve label for severity level '${mockTicket.severity}'. Is this a valid support severity level?`
      );
    }

    mockAppendFeatureFlags({
      supportTicketSeverity: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
    mockCreateSupportTicket(mockTicket).as('createTicket');
    mockGetSupportTickets([]);
    mockGetSupportTicket(mockTicket);
    mockGetSupportTicketReplies(mockTicket.id, []);

    cy.visitWithLogin('/support/tickets');

    // Confirm that "Severity" table column is displayed.
    cy.get('[data-qa-open-tickets-tab]').within(() => {
      cy.findByLabelText('Sort by severity').should('be.visible');
    });

    ui.button
      .findByTitle('Open New Ticket')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out ticket form.
    ui.dialog
      .findByTitle('Open a Support Ticket')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Title', { exact: false })
          .should('be.visible')
          .click()
          .type(mockTicket.summary);

        cy.findByLabelText('Severity')
          .should('be.visible')
          .click()
          .type(`${mockTicket.severity}{downarrow}{enter}`);

        cy.get('[data-qa-ticket-description]')
          .should('be.visible')
          .click()
          .type(mockTicket.description);

        ui.button
          .findByTitle('Open Ticket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that ticket create payload contains the expected data.
    cy.wait('@createTicket').then((xhr) => {
      expect(xhr.request.body?.summary).to.eq(mockTicket.summary);
      expect(xhr.request.body?.description).to.eq(mockTicket.description);
      expect(xhr.request.body?.severity).to.eq(mockTicket.severity);
    });

    // Confirm redirect to details page and that severity level is displayed.
    cy.url().should('endWith', `support/tickets/${mockTicket.id}`);
    cy.get('[data-qa-ticket-status]')
      .should('be.visible')
      .within(() => {
        cy.findByText(severityLabel).should('be.visible');
      });
  });
});
