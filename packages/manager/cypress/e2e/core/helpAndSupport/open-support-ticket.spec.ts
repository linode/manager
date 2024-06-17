/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-duplicate-string */
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
  randomString,
} from 'support/util/random';
import { accountFactory, supportTicketFactory } from 'src/factories';
import {
  mockAttachSupportTicketFile,
  mockCreateSupportTicket,
  mockGetSupportTicket,
  mockGetSupportTickets,
  mockGetSupportTicketReplies,
} from 'support/intercepts/support';
import {
  SEVERITY_LABEL_MAP,
  SMTP_DIALOG_TITLE,
  SMTP_HELPER_TEXT,
} from 'src/features/Support/SupportTickets/constants';
import { formatDescription } from 'src/features/Support/SupportTickets/ticketUtils';
import { mockGetAccount } from 'support/intercepts/account';
import {
  EntityType,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';
import { createTestLinode } from 'support/util/linodes';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';
import { MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED } from 'src/constants';

describe('help & support', () => {
  after(() => {
    cleanUp(['linodes']);
  });

  authenticate();

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

      cy.contains('Open New Ticket').click();
      cy.get('input[placeholder="Enter a title for your ticket."]')
        .click({ scrollBehavior: false })
        .type(ticketLabel);
      cy.findByLabelText('Severity').should('not.exist');
      cy.get('[data-qa-ticket-entity-type]').click();
      cy.contains('General/Account/Billing').should('be.visible');
      cy.get('[data-qa-ticket-description="true"]')
        .click()
        .type(ticketDescription);
      cy.get('[id="attach-file"]').attachFile(image);
      cy.get('[value="test_screenshot.png"]').should('be.visible');
      cy.get('[data-qa-submit="true"]').click();

      cy.wait('@createTicket').its('response.statusCode').should('eq', 200);
      cy.wait('@attachmentPost').its('response.statusCode').should('eq', 200);
      cy.wait('@getReplies').its('response.statusCode').should('eq', 200);

      cy.contains(`#${ticketId}: ${ticketLabel}`).should('be.visible');
      cy.contains(ticketDescription).should('be.visible');
      cy.contains(image).should('be.visible');
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
    const severityLabel = SEVERITY_LABEL_MAP.get(mockTicket.severity!);
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

  /*
   * - Opens a SMTP Restriction Removal ticket using mock API data.
   * - Confirms that the SMTP-specific fields are displayed and handled correctly.
   */
  it.only('can create an SMTP support ticket', () => {
    const mockAccount = accountFactory.build({
      first_name: 'Jane',
      last_name: 'Doe',
      company: 'Acme Co.',
      active_since: MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED,
    });

    const mockFormFields = {
      useCase: randomString(),
      publicInfo: randomString(),
      description: '',
      entityId: '',
      entityInputValue: '',
      entityType: 'general' as EntityType,
      selectedSeverity: undefined,
      summary: 'SMTP Restriction Removal on',
      ticketType: 'smtp' as TicketType,
      customerName: `${mockAccount.first_name} ${mockAccount.last_name}`,
      companyName: mockAccount.company,
      emailDomains: randomString(),
    };

    const mockSMTPTicket = supportTicketFactory.build({
      summary: mockFormFields.summary,
      id: randomNumber(),
      description: formatDescription(mockFormFields, 'smtp'),
      status: 'new',
    });

    mockGetAccount(mockAccount);
    mockCreateSupportTicket(mockSMTPTicket).as('createTicket');
    mockGetSupportTickets([]);
    mockGetSupportTicket(mockSMTPTicket);
    mockGetSupportTicketReplies(mockSMTPTicket.id, []);

    cy.visitWithLogin('/support/tickets');

    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('open a support ticket').should('be.visible').click();

      // Fill out ticket form.
      ui.dialog
        .findByTitle('Contact Support: SMTP Restriction Removal')
        .should('be.visible')
        .within(() => {
          cy.findByText(SMTP_DIALOG_TITLE).should('be.visible');
          cy.findByText(SMTP_HELPER_TEXT).should('be.visible');

          // Confirm summary, customer name, and company name fields are pre-populated with user account data.
          cy.findByLabelText('Title', { exact: false })
            .should('be.visible')
            .should('contain.value', mockFormFields.summary);

          cy.findByLabelText('First and last name', { exact: false })
            .should('be.visible')
            .should('have.value', mockFormFields.customerName);

          cy.findByLabelText('Business or company name', { exact: false })
            .should('be.visible')
            .should('have.value', mockFormFields.companyName);

          ui.button
            .findByTitle('Open Ticket')
            .scrollIntoView()
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Confirm validation errors display when trying to submit without required fields.
          cy.findByText('Use case is required.');
          cy.findByText('Email domains are required.');
          cy.findByText('Links to public information are required.');

          // Complete the rest of the form.
          cy.get('[data-qa-ticket-use-case]')
            .should('be.visible')
            .click()
            .type(mockFormFields.useCase);

          cy.get('[data-qa-ticket-email-domains]')
            .should('be.visible')
            .click()
            .type(mockFormFields.emailDomains);

          cy.get('[data-qa-ticket-public-info]')
            .should('be.visible')
            .click()
            .type(mockFormFields.publicInfo);

          // Confirm there is no description field or file upload section.
          cy.findByText('Description').should('not.exist');
          cy.findByText('Attach a File').should('not.exist');

          ui.button
            .findByTitle('Open Ticket')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that ticket create payload contains the expected data.
      // TODO: fix this failure.
      cy.wait('@createTicket').then((xhr) => {
        expect(xhr.request.body?.summary).to.eq(mockSMTPTicket.summary);
        expect(xhr.request.body?.description).to.eq(mockSMTPTicket.description);
      });

      // Confirm the new ticket is listed with the expected information upon redirecting to the details page.
      cy.url().should('endWith', `support/tickets/${mockSMTPTicket.id}`);
      cy.contains(`#${mockSMTPTicket}: ${mockSMTPTicket.summary}`).should(
        'be.visible'
      );
      cy.contains(mockSMTPTicket.description).should('be.visible');
    });
  });
});
