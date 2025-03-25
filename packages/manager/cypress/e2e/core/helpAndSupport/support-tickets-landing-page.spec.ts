import { linodeConfigInterfaceFactory } from '@linode/utilities';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { interceptGetProfile } from 'support/intercepts/profile';
import {
  mockGetSupportTicket,
  mockGetSupportTicketReplies,
  mockGetSupportTickets,
} from 'support/intercepts/support';
import {
  randomItem,
  randomLabel,
  randomNumber,
  randomPhrase,
} from 'support/util/random';

import {
  entityFactory,
  linodeConfigFactory,
  linodeFactory,
  supportTicketFactory,
  volumeFactory,
} from 'src/factories';
import { SEVERITY_LABEL_MAP } from 'src/features/Support/SupportTickets/constants';

import type { Config, Disk } from '@linode/api-v4';

describe('support tickets landing page', () => {
  /*
   * - Confirms that "No items to display" is shown when the user has no open support tickets.
   */
  it('shows the empty message when there are no tickets.', () => {
    mockAppendFeatureFlags({
      supportTicketSeverity: false,
    });

    interceptGetProfile().as('getProfile');

    // intercept get ticket request, stub response.
    mockGetSupportTickets([]).as('getSupportTickets');

    cy.visitWithLogin('/support/tickets');

    cy.wait(['@getProfile', '@getSupportTickets']);

    cy.get('[data-qa-open-tickets-tab]').within(() => {
      // Confirm that "Severity" table column is not shown.
      cy.findByLabelText('Sort by severity').should('not.exist');

      // Confirm that other table columns are shown.
      cy.findByText('Subject').should('be.visible');
      cy.findByText('Ticket ID').should('be.visible');
      cy.findByText('Regarding').should('be.visible');
      cy.findByText('Date Created').should('be.visible');
      cy.findByText('Last Updated').should('be.visible');
      cy.findByText('Updated By').should('be.visible');
    });

    // Confirm that no ticket is listed.
    cy.findByText('No items to display.').should('be.visible');
  });

  /*
   * - Confirms that support tickets are listed in the table when the user has ones.
   */
  it('lists support tickets in the table as expected', () => {
    // TODO Integrate this test with the above test when feature flag goes away.
    const mockTicket = supportTicketFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      severity: randomItem([1, 2, 3]),
      status: 'new',
      summary: randomLabel(),
    });

    const mockAnotherTicket = supportTicketFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      severity: randomItem([1, 2, 3]),
      status: 'open',
      summary: randomLabel(),
    });

    const mockTickets = [mockTicket, mockAnotherTicket];

    mockAppendFeatureFlags({
      supportTicketSeverity: true,
    });
    mockGetSupportTickets(mockTickets);

    cy.visitWithLogin('/support/tickets');

    cy.get('[data-qa-open-tickets-tab]').within(() => {
      // Confirm that "Severity" table column is displayed.
      cy.findByLabelText('Sort by severity').should('be.visible');

      // Confirm that other table columns are shown.
      cy.findByText('Subject').should('be.visible');
      cy.findByText('Ticket ID').should('be.visible');
      cy.findByText('Regarding').should('be.visible');
      cy.findByText('Date Created').should('be.visible');
      cy.findByText('Last Updated').should('be.visible');
      cy.findByText('Updated By').should('be.visible');
    });

    mockTickets.forEach((ticket) => {
      // Get severity label for numeric severity level.
      // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
      const severityLabel = SEVERITY_LABEL_MAP.get(ticket.severity!);
      if (!severityLabel) {
        throw new Error(
          `Unable to retrieve label for severity level '${ticket.severity}'. Is this a valid support severity level?`
        );
      }

      // Confirm that tickets are listed as expected.
      cy.findByText(ticket.summary)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(ticket.id).should('be.visible');
          cy.findByText(severityLabel).should('be.visible');
        });
    });
  });

  /*
   * - Confirms that clicking on the ticket subject navigates to the ticket's page.
   */
  it("can navigate to the ticket's page when clicking on the ticket subject", () => {
    // TODO Integrate this test with the above test when feature flag goes away.
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
  });

  /*
   * - Confirms that the entity is shown in the table when the support ticket is related to it.
   * - Confirms that clicking the entity's label redirects to that entity's page
   */
  it("can navigate to the entity's page when clicking the entity's label", () => {
    // TODO Integrate this test with the above test when feature flag goes away.
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: `${randomLabel()}-linode`,
    });
    const mockVolume = volumeFactory.build();
    const mockPublicConfigInterface = linodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockConfig: Config = linodeConfigFactory.build({
      id: randomNumber(),
      interfaces: [
        // The order of this array is significant. Index 0 (eth0) should be public.
        mockPublicConfigInterface,
      ],
    });
    const mockDisks: Disk[] = [
      {
        created: '2020-08-21T17:26:14',
        filesystem: 'ext4',
        id: 44311273,
        label: 'Debian 10 Disk',
        size: 81408,
        status: 'ready',
        updated: '2020-08-21T17:26:30',
      },
      {
        created: '2020-08-21T17:26:14',
        filesystem: 'swap',
        id: 44311274,
        label: '512 MB Swap Image',
        size: 512,
        status: 'ready',
        updated: '2020-08-21T17:26:31',
      },
    ];

    const mockEntity = entityFactory.build({
      id: mockLinode.id,
      label: `${randomLabel()}-entity`,
      type: 'linode',
      url: 'https://www.example.com',
    });

    const mockTicket = supportTicketFactory.build({
      description: randomPhrase(),
      entity: mockEntity,
      id: randomNumber(),
      severity: randomItem([1, 2, 3]),
      status: 'new',
      summary: `${randomLabel()}-support-ticket`,
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
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');
    mockGetLinodeVolumes(mockLinode.id, [mockVolume]).as('getVolumes');

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

    // Clicking on the entity will redirect to the entity's page.
    cy.findByText(`${mockEntity.label}`).should('be.visible').click();
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
  });
});
