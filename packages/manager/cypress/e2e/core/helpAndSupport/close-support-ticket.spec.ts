import 'cypress-file-upload';
import {
  closableMessage,
  closeButtonText,
} from 'support/constants/help-and-support';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCloseSupportTicket,
  mockGetSupportTicket,
  mockGetSupportTicketReplies,
  mockGetSupportTickets,
} from 'support/intercepts/support';
import { ui } from 'support/ui';
import {
  randomItem,
  randomLabel,
  randomNumber,
  randomPhrase,
} from 'support/util/random';

import { supportTicketFactory } from 'src/factories';
import { SEVERITY_LABEL_MAP } from 'src/features/Support/SupportTickets/constants';

describe('close support tickets', () => {
  /*
   * - Opens a Help & Support ticket with mocked ticket data.
   * - Confirms that there is no "close ticket" button showing up for the default support ticket.
   */
  it('cannot close a default support ticket by customers', () => {
    const mockTicket = supportTicketFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      severity: randomItem([1, 2, 3]),
      status: 'new',
      summary: randomLabel(),
    });

    // Get severity label for numeric severity level.
    // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
    const severityLabel = SEVERITY_LABEL_MAP.get(mockTicket.severity!);
    if (!severityLabel) {
      throw new Error(
        `Unable to retrieve label for severity level '${mockTicket.severity}'. Is this a valid support severity level?`
      );
    }

    mockAppendFeatureFlags({
      supportTicketSeverity: true,
    });
    mockGetSupportTickets([mockTicket]);
    mockGetSupportTicket(mockTicket).as('getSupportTicket');
    mockGetSupportTicketReplies(mockTicket.id, []).as('getReplies');

    cy.visitWithLogin('/support/tickets');

    // Confirm that tickets are listed as expected.
    cy.findByText(mockTicket.summary).should('be.visible').click();

    cy.wait(['@getSupportTicket', '@getReplies']);

    cy.url().should('endWith', `/tickets/${mockTicket.id}`);
    cy.findByText(
      mockTicket.status.substring(0, 1).toUpperCase() +
        mockTicket.status.substring(1)
    ).should('be.visible');
    cy.findByText(`#${mockTicket.id}: ${mockTicket.summary}`).should(
      'be.visible'
    );
    cy.findByText(mockTicket.description).should('be.visible');
    cy.findByText(severityLabel).should('be.visible');

    // Confirm that the support ticket is not closable by default.
    cy.findByText(closableMessage, { exact: false }).should('not.exist');
  });

  /*
   * - Opens a Help & Support ticket with mocked ticket data.
   * - Confirms that the closable support ticket can be closed by customers successfully.
   */
  it('can close a closable support ticket', () => {
    const mockTicket = supportTicketFactory.build({
      closable: true,
      description: randomPhrase(),
      id: randomNumber(),
      severity: randomItem([1, 2, 3]),
      status: 'new',
      summary: randomLabel(),
    });

    const mockClosedTicket = supportTicketFactory.build({
      ...mockTicket,
      closed: 'close by customers',
      status: 'closed',
    });

    // Get severity label for numeric severity level.
    // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
    const severityLabel = SEVERITY_LABEL_MAP.get(mockTicket.severity!);
    if (!severityLabel) {
      throw new Error(
        `Unable to retrieve label for severity level '${mockTicket.severity}'. Is this a valid support severity level?`
      );
    }

    mockAppendFeatureFlags({
      supportTicketSeverity: true,
    });
    mockGetSupportTickets([mockTicket]);
    mockGetSupportTicket(mockTicket).as('getSupportTicket');
    mockGetSupportTicketReplies(mockTicket.id, []).as('getReplies');
    mockCloseSupportTicket(mockTicket.id).as('closeSupportTicket');

    cy.visitWithLogin('/support/tickets');

    // Confirm that tickets are listed as expected.
    cy.findByText(mockTicket.summary).should('be.visible').click();

    cy.wait(['@getSupportTicket', '@getReplies']);

    // Confirm that the closable message shows up.
    cy.findByText(closableMessage, { exact: false }).should('be.visible');

    // Confirm that the "close the ticket" button can be clicked.
    ui.button.findByTitle(closeButtonText).should('be.visible').click();
    ui.dialog
      .findByTitle('Confirm Ticket Close')
      .should('be.visible')
      .within(() => {
        cy.findByText('Are you sure you want to close this ticket?').should(
          'be.visible'
        );
        ui.button
          .findByTitle('Confirm')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@closeSupportTicket');
      });

    mockGetSupportTickets([mockClosedTicket]);
    mockGetSupportTicket(mockClosedTicket).as('getClosedSupportTicket');
    cy.visit('/support/tickets');

    // Confirm that the ticket is closed.
    cy.findByText(mockClosedTicket.summary).should('be.visible').click();
    cy.wait('@getClosedSupportTicket');
    cy.get('[aria-label="Ticket status is closed"]').should('be.visible');
    cy.findByText('Closed');
  });
});
