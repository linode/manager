// must turn off sort-objects rule in this file bc mockTicket.description is set by formatDescription fn in which attribute order is nonalphabetical and affects test result

import { linodeFactory } from '@linode/utilities';
/* eslint-disable sonarjs/no-duplicate-string */
import 'cypress-file-upload';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetDomains } from 'support/intercepts/domains';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateLinodeAccountLimitError,
  mockGetLinodeDetails,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import { mockGetClusters } from 'support/intercepts/lke';
import { interceptGetProfile } from 'support/intercepts/profile';
import {
  mockAttachSupportTicketFile,
  mockCreateSupportTicket,
  mockGetSupportTicket,
  mockGetSupportTicketReplies,
  mockGetSupportTickets,
} from 'support/intercepts/support';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import {
  randomItem,
  randomLabel,
  randomNumber,
  randomPhrase,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  domainFactory,
  supportTicketFactory,
} from 'src/factories';
import {
  ACCOUNT_LIMIT_DIALOG_TITLE,
  ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP,
  ACCOUNT_LIMIT_HELPER_TEXT,
  SEVERITY_LABEL_MAP,
  SMTP_DIALOG_TITLE,
  SMTP_FIELD_NAME_TO_LABEL_MAP,
  SMTP_HELPER_TEXT,
} from 'src/features/Support/SupportTickets/constants';
import { formatDescription } from 'src/features/Support/SupportTickets/ticketUtils';

import type {
  EntityType,
  TicketType,
} from 'src/features/Support/SupportTickets/SupportTicketDialog';

describe('open support tickets', () => {
  /*
   * - Opens a Help & Support ticket using mock API data.
   * - Confirms that "Severity" field is not present when feature flag is disabled.
   */
  it('can open a support ticket', () => {
    mockAppendFeatureFlags({
      supportTicketSeverity: false,
    });

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
      cy.get('input[placeholder="Enter a title for your ticket."]').click({
        scrollBehavior: false,
      });
      cy.focused().type(ticketLabel);
      cy.findByLabelText('Severity').should('not.exist');
      ui.autocomplete
        .findByLabel('What is this regarding?')
        .type('General/Account/Billing');

      ui.autocompletePopper
        .findByTitle('General/Account/Billing')
        .should('be.visible')
        .click();
      cy.get('[data-qa-ticket-description="true"]').click();
      cy.focused().type(ticketDescription);
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
      supportTicketSeverity: true,
    });
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
          .click();
        cy.focused().type(mockTicket.summary);

        cy.findByLabelText('Severity').should('be.visible').click();
        cy.focused().type(`${mockTicket.severity}{downarrow}{enter}`);

        cy.get('[data-qa-ticket-description]').should('be.visible').click();
        cy.focused().type(mockTicket.description);

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
   * - Opens an SMTP Restriction Removal ticket using mock API data.
   * - Creates a new linode that will have SMTP restrictions and navigates to a SMTP support ticket via notice link.
   * - Confirms that the SMTP-specific fields are displayed and handled correctly.
   */
  it('can create an SMTP support ticket', () => {
    const mockAccount = accountFactory.build({
      first_name: 'Jane',
      last_name: 'Doe',
      company: 'Acme Co.',
    });

    const mockFormFields = {
      description: '',
      entityId: '',
      entityInputValue: '',
      entityType: 'general' as EntityType,
      selectedSeverity: undefined,
      summary: 'SMTP Restriction Removal on ',
      ticketType: 'smtp' as TicketType,
      companyName: mockAccount.company,
      customerName: `${mockAccount.first_name} ${mockAccount.last_name}`,
      useCase: randomString(),
      emailDomains: randomString(),
      publicInfo: randomString(),
    };

    const mockSMTPTicket = supportTicketFactory.build({
      summary: mockFormFields.summary,
      id: randomNumber(),
      description: formatDescription(mockFormFields, 'smtp'),
      status: 'new',
    });

    // Mock a Linode instance that is lacking the `SMTP Enabled` capability.
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      capabilities: [],
    });

    mockGetAccount(mockAccount);
    mockCreateSupportTicket(mockSMTPTicket).as('createTicket');
    mockGetSupportTickets([]);
    mockGetSupportTicket(mockSMTPTicket);
    mockGetSupportTicketReplies(mockSMTPTicket.id, []);
    mockGetLinodes([mockLinode]);
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
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
          .should('have.value', mockFormFields.summary + mockLinode.label);

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
        cy.get('[data-qa-ticket-use-case]').should('be.visible').click();
        cy.focused().type(mockFormFields.useCase);

        cy.get('[data-qa-ticket-email-domains]').should('be.visible').click();
        cy.focused().type(mockFormFields.emailDomains);

        cy.get('[data-qa-ticket-public-info]').should('be.visible').click();
        cy.focused().type(mockFormFields.publicInfo);

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
    cy.wait('@createTicket').then((xhr) => {
      expect(xhr.request.body?.summary).to.eq(
        mockSMTPTicket.summary + mockLinode.label
      );
      expect(xhr.request.body?.description).to.eq(mockSMTPTicket.description);
    });

    // Confirm the new ticket is listed with the expected information upon redirecting to the details page.
    cy.url().should('endWith', `support/tickets/${mockSMTPTicket.id}`);
    cy.contains(`#${mockSMTPTicket.id}: SMTP Restriction Removal`).should(
      'be.visible'
    );
    Object.values(SMTP_FIELD_NAME_TO_LABEL_MAP).forEach((fieldLabel) => {
      cy.findByText(fieldLabel).should('be.visible');
    });
  });

  /*
   * - Opens an Account Limit ticket using mock API data.
   * - Mocks an account limit API error and navigates to the support ticket via notice link.
   * - Confirms that the Account-Limit-specific fields are pre-populated, displayed, and handled correctly.
   */
  it('can create an Account Limit support ticket', () => {
    const mockAccount = accountFactory.build({
      first_name: 'Jane',
      last_name: 'Doe',
      company: 'Acme Co.',
    });

    const mockFormFields = {
      description: '',
      entityId: '',
      entityInputValue: '',
      entityType: 'linode_id' as EntityType,
      selectedSeverity: undefined,
      summary: 'Account Limit Increase',
      ticketType: 'accountLimit' as TicketType,
      customerName: `${mockAccount.first_name} ${mockAccount.last_name}`,
      companyName: mockAccount.company,
      numberOfEntities: '2',
      linodePlan: 'Nanode 1GB',
      useCase: randomString(),
      publicInfo: randomString(),
    };

    const mockAccountLimitTicket = supportTicketFactory.build({
      summary: mockFormFields.summary,
      id: randomNumber(),
      description: formatDescription(mockFormFields, 'accountLimit'),
      status: 'new',
    });

    const mockRegion = chooseRegion();
    const mockPlan = {
      planType: 'Shared CPU',
      planLabel: 'Nanode 1 GB',
      planId: 'g6-nanode-1',
    };

    const mockLinode = linodeFactory.build();

    const ACCOUNT_THING_LIMIT_ERROR =
      'A limit on your account is preventing the deployment of the selected Linode plan. To request access to the plan, please contact Support and provide the Linode plan name.';

    mockGetAccount(mockAccount);
    mockCreateLinodeAccountLimitError(ACCOUNT_THING_LIMIT_ERROR, 400).as(
      'createLinode'
    );
    mockCreateSupportTicket(mockAccountLimitTicket).as('createTicket');
    mockGetSupportTickets([]);
    mockGetSupportTicket(mockAccountLimitTicket);
    mockGetSupportTicketReplies(mockAccountLimitTicket.id, []);
    mockGetLinodes([mockLinode]);

    cy.visitWithLogin('/linodes/create');

    // Set Linode label, distribution, plan type, password, etc.
    // linodeCreatePage.setLabel(linodeLabel);
    linodeCreatePage.selectRegionById(mockRegion.id);
    linodeCreatePage.selectPlan(mockPlan.planType, mockPlan.planLabel);
    linodeCreatePage.setRootPassword(randomString(32));

    // Attempt to create Linode and confirm mocked account limit error with support link is present.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLinode');

    cy.get('[data-qa-error="true"]').first().scrollIntoView();
    cy.contains(ACCOUNT_THING_LIMIT_ERROR);

    // Navigate to the account limit ticket form.
    cy.findByText('contact Support').should('be.visible').click();

    // Fill out ticket form.
    ui.dialog
      .findByTitle(`Contact Support: ${mockFormFields.summary}`)
      .should('be.visible')
      .within(() => {
        cy.findByText(ACCOUNT_LIMIT_DIALOG_TITLE).should('be.visible');
        cy.findByText(ACCOUNT_LIMIT_HELPER_TEXT).should('be.visible');

        // Confirm summary, customer name, and company name fields are pre-populated with user account data.
        cy.findByLabelText('Title', { exact: false })
          .should('be.visible')
          .should('have.value', mockFormFields.summary);

        cy.findByLabelText('First and last name', { exact: false })
          .should('be.visible')
          .should('have.value', mockFormFields.customerName);

        cy.findByLabelText('Business or company name', { exact: false })
          .should('be.visible')
          .should('have.value', mockFormFields.companyName);

        // Confirm plan pre-populates from form payload data.
        cy.findByLabelText('Which Linode plan do you need access to?', {
          exact: false,
        })
          .should('be.visible')
          .should('have.value', mockFormFields.linodePlan);

        // Confirm helper text and link.
        cy.findByText('Current number of Linodes: 1').should('be.visible');
        cy.findByText('View types of plans')
          .should('be.visible')
          .should('have.attr', 'href', 'https://www.linode.com/pricing/');

        ui.button
          .findByTitle('Open Ticket')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm validation errors display when trying to submit without required fields.
        cy.findByText('Use case is required.');
        cy.findByText('Links to public information are required.');

        // Complete the rest of the form.
        cy.findByLabelText('Total number of Linodes you need?')
          .should('be.visible')
          .click();
        cy.focused().type(mockFormFields.numberOfEntities);

        cy.get('[data-qa-ticket-use-case]').should('be.visible').click();
        cy.focused().type(mockFormFields.useCase);

        cy.get('[data-qa-ticket-public-info]').should('be.visible').click();
        cy.focused().type(mockFormFields.publicInfo);

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
    cy.wait('@createTicket').then((xhr) => {
      expect(xhr.request.body?.summary).to.eq(mockAccountLimitTicket.summary);
      expect(xhr.request.body?.description).to.eq(
        mockAccountLimitTicket.description
      );
    });

    // Confirm the new ticket is listed with the expected information upon redirecting to the details page.
    cy.url().should('endWith', `support/tickets/${mockAccountLimitTicket.id}`);
    cy.contains(
      `#${mockAccountLimitTicket.id}: ${mockAccountLimitTicket.summary}`
    ).should('be.visible');
    Object.entries(ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP).forEach(
      ([key, fieldLabel]) => {
        let _fieldLabel = fieldLabel;
        if (key === 'useCase' || key === 'numberOfEntities') {
          _fieldLabel = _fieldLabel.replace('entities', 'Linodes');
        }
        cy.findByText(_fieldLabel).should('be.visible');
      }
    );
  });

  /*
   * - Opens a general support ticket with a selected entity using mock API data.
   * - Confirms that the entity fields are populated, displayed, and validated correctly.
   */
  it('can create a support ticket with an entity', () => {
    const mockLinodes = linodeFactory.buildList(2);
    const mockDomain = domainFactory.build();

    const mockTicket = supportTicketFactory.build({
      id: randomNumber(),
      summary: randomLabel(),
      description: randomPhrase(),
      status: 'new',
    });

    mockCreateSupportTicket(mockTicket).as('createTicket');
    mockGetClusters([]);
    mockGetSupportTickets([]);
    mockGetSupportTicket(mockTicket);
    mockGetSupportTicketReplies(mockTicket.id, []);
    mockGetLinodes(mockLinodes);
    mockGetDomains([mockDomain]);

    cy.visitWithLogin('/support/tickets');

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
          .click();
        cy.focused().type(mockTicket.summary);

        cy.get('[data-qa-ticket-description]').should('be.visible').click();
        cy.focused().type(mockTicket.description);

        cy.get('[data-qa-ticket-entity-type]').click();
        cy.focused().type(`Linodes{downarrow}{enter}`);

        // Attempt to submit the form without an entity selected and confirm validation error.
        ui.button
          .findByTitle('Open Ticket')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Please select a Linode.').should('be.visible');

        // Select an entity type for which there are no entities.
        cy.get('[data-qa-ticket-entity-type]').click();
        cy.focused().type(`Kubernetes{downarrow}{enter}`);

        // Confirm the validation error clears when a new entity type is selected.
        cy.findByText('Please select a Linode.').should('not.exist');

        // Confirm helper text appears and entity id field is disabled.
        cy.findByText(
          'You don’t have any Kubernetes Clusters on your account.'
        ).should('be.visible');
        cy.get('[data-qa-ticket-entity-id]')
          .find('input')
          .should('be.disabled');

        // Select another entity type.
        cy.get('[data-qa-ticket-entity-type]').click();
        cy.focused().type(`{selectall}{del}Domains{uparrow}{enter}`);

        // Select an entity.
        cy.get('[data-qa-ticket-entity-id]').should('be.visible').click();
        cy.focused().type(`${mockDomain.domain}{downarrow}{enter}`);

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
    });

    // Confirm redirect to details page and that severity level is displayed.
    cy.url().should('endWith', `support/tickets/${mockTicket.id}`);
  });
});
