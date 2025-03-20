/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page.
 * This file verifies the UI, functionality, and sorting/filtering of the CloudPulse Alerts Listing Page.
 */
import { cloudPulseServiceMap } from 'support/constants/cloudpulse';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAllAlertDefinitions,
  mockGetCloudPulseServices,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { accountFactory, alertFactory } from 'src/factories';
import {
  OPTIMISTIC_SUCCESS_MESSAGE,
  alertStatuses,
} from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Alert } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const now = new Date();
const mockAlerts = [
  alertFactory.build({
    created_by: 'user1',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Alert-1',
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'user',
    updated: new Date(now.getTime() - 86400).toISOString(),
  }),
  alertFactory.build({
    created_by: 'user4',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Alert-2',
    service_type: 'dbaas',
    severity: 0,
    status: 'disabled',
    type: 'user',
    updated: new Date(now.getTime() - 10 * 86400).toISOString(),
  }),
  alertFactory.build({
    created_by: 'user2',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Alert-3',
    service_type: 'linode',
    severity: 2,
    status: 'enabled',
    type: 'user',
    updated: new Date(now.getTime() - 6 * 86400).toISOString(),
  }),
  alertFactory.build({
    created_by: 'user3',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Alert-4',
    service_type: 'linode',
    severity: 3,
    status: 'disabled',
    type: 'user',
    updated: new Date(now.getTime() - 4 * 86400).toISOString(),
  }),
];

/**
 * @description
 * This code validates the presence and correct text of the table headers
 * inside the alert table. It checks if each header matches the expected
 * values as defined in the `expectedHeaders` array.
 *
 * For each header, the code performs the following actions:
 * 1. Locates the table with the `data-qa="alert-table"` attribute.
 * 2. Iterates through the `expectedHeaders` array.
 * 3. For each header, it ensures the table contains a column with the exact header text.
 *
 * @usage
 * This check is typically used in UI tests to ensure that the table headers
 * match the expected structure when displayed in the application.
 */
const expectedHeaders = [
  'Alert Name',
  'Service',
  'Status',
  'Last Modified',
  'Created By',
];

/**
 * Verifies sorting of a column in the alerts table.
 * @param {string} header - The `data-qa-header` attribute of the column to sort.
 * @param {'ascending' | 'descending'} sortOrder - Expected sorting order.
 * @param {number[]} expectedValues - Expected values in sorted order.
 */
const verifyTableSorting = (
  header: string,
  sortOrder: 'ascending' | 'descending',
  expectedValues: number[]
) => {
  ui.heading.findByText(header).click();
  ui.heading.findByText(header).should('have.attr', 'aria-sort', sortOrder);

  cy.get('[data-qa="alert-table"]').within(() => {
    cy.get('[data-qa-alert-cell]').should(($cells) => {
      const actualOrder = $cells
        .map((_, cell) =>
          parseInt(cell.getAttribute('data-qa-alert-cell')!, 10)
        )
        .get();
      expectedValues.forEach((value, index) => {
        expect(actualOrder[index]).to.equal(value);
      });
    });
  });
};

/**
 * @param {Alert} alert - The alert object to validate.
 */
const validateAlertDetails = (alert: Alert) => {
  const { created_by, id, label, service_type, status, updated } = alert;

  cy.get(`[data-qa-alert-cell="${id}"]`).within(() => {
    cy.findByText(cloudPulseServiceMap[service_type])
      .should('be.visible')
      .and('have.text', cloudPulseServiceMap[service_type]);

    cy.findByText(alertStatuses[status])
      .should('be.visible')
      .and('have.text', alertStatuses[status]);
    cy.findByText(label)
      .should('be.visible')
      .and('have.text', label)
      .and(
        'have.attr',
        'href',
        `/alerts/definitions/detail/${service_type}/${id}`
      );
    cy.findByText(formatDate(updated, { format: 'MMM dd, yyyy, h:mm a' }))
      .should('be.visible')
      .and(
        'have.text',
        formatDate(updated, { format: 'MMM dd, yyyy, h:mm a' })
      );
    cy.findByText(created_by).should('be.visible').and('have.text', created_by);
  });
};

describe('Integration Tests for CloudPulse Alerts Listing Page', () => {
  /*
   * - Verifies UI elements, navigation, and alert details in the listing page.
   * - Confirms sorting functionality for multiple columns (Alert Name, Service, Status, Last Modified, Created By).
   * - Validates filtering and search functionality for alerts by name, service, and status.
   * - Ensures users can disable and enable alerts successfully.
   * - Confirms UI properly updates alert statuses after enabling or disabling alerts.
   * - Ensures API calls return correct responses and status codes.
   */
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(['linode', 'dbaas']);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    mockUpdateAlertDefinitions('dbaas', 1, mockAlerts[0]).as(
      'getFirstAlertDefinitions'
    );
    mockUpdateAlertDefinitions('dbaas', 2, mockAlerts[1]).as(
      'getSecondAlertDefinitions'
    );
    cy.visitWithLogin('/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');
  });

  it('should verify sorting functionality for multiple columns in ascending and descending order', () => {
    const sortCases = [
      { ascending: [1, 2, 3, 4], column: 'label', descending: [4, 3, 2, 1] },
      { ascending: [2, 4, 1, 3], column: 'status', descending: [1, 3, 2, 4] },
      {
        ascending: [2, 1, 4, 3],
        column: 'service_type',
        descending: [4, 3, 2, 1],
      },
      {
        ascending: [1, 3, 4, 2],
        column: 'created_by',
        descending: [2, 4, 3, 1],
      },
      { ascending: [2, 3, 4, 1], column: 'updated', descending: [1, 4, 3, 2] },
    ];

    sortCases.forEach(({ ascending, column, descending }) => {
      // Verify descending order
      verifyTableSorting(column, 'descending', descending);

      // Verify ascending order
      verifyTableSorting(column, 'ascending', ascending);
    });
  });

  it('should validate UI elements and alert details', () => {
    // Validate navigation links and buttons
    cy.findByText('Alerts').should('be.visible');

    cy.findByText('Definitions')
      .should('be.visible')
      .and('have.attr', 'href', '/alerts/definitions');
    ui.buttonGroup.findButtonByTitle('Create Alert').should('be.visible');

    // Validate table headers
    cy.get('[data-qa="alert-table"]').within(() => {
      expectedHeaders.forEach((header) => {
        cy.findByText(header).should('have.text', header);
      });
    });

    // Validate alert details
    mockAlerts.forEach((alert) => {
      validateAlertDetails(alert);
    });
  });

  it('should search and filter alerts by name, service, and status, and clear filters', () => {
    // Search by alert name and validate the results
    cy.findByPlaceholderText('Search for Alerts')
      .should('be.visible')
      .and('not.be.disabled')
      .type(mockAlerts[0].label);

    cy.get(`[data-qa-alert-cell="${mockAlerts[0].id}"]`).should('be.visible');
    [1, 2, 3].forEach((index) => {
      cy.get(`[data-qa-alert-cell="${mockAlerts[index].id}"]`).should(
        'not.exist'
      );
    });

    // Clear the previous search by alert name
    cy.get('[data-qa-filter="alert-search"]').within(() => {
      cy.findByTestId('textfield-input').clear();
    });

    // Filter by alert service and validate the results
    cy.findByPlaceholderText('Select a Service')
      .should('be.visible')
      .type('Databases{enter}');

    cy.focused().click();

    cy.get('[data-qa="alert-table"]')
      .find('[data-qa-alert-cell]')
      .should('have.length', 2);

    [0, 1].forEach((index) => {
      cy.get(`[data-qa-alert-cell="${mockAlerts[index].id}"]`).should(
        'be.visible'
      );
    });
    [2, 3].forEach((index) => {
      cy.get(`[data-qa-alert-cell="${mockAlerts[index].id}"]`).should(
        'not.exist'
      );
    });

    // Clear the service filter
    cy.get('[data-qa-filter="alert-service-filter"]').within(() => {
      ui.button
        .findByAttribute('aria-label', 'Clear')
        .should('be.visible')
        .scrollIntoView();
      ui.button.findByAttribute('aria-label', 'Clear').click();
    });

    // Filter by alert status and validate the results
    cy.findByPlaceholderText('Select a Status')
      .should('be.visible')
      .type('Enabled{enter}');

    cy.focused().click();

    cy.get('[data-qa="alert-table"]')
      .find('[data-qa-alert-cell]')
      .should('have.length', 2);

    [0, 2].forEach((index) => {
      cy.get(`[data-qa-alert-cell="${mockAlerts[index].id}"]`).should(
        'be.visible'
      );
    });
    [1, 3].forEach((index) => {
      cy.get(`[data-qa-alert-cell="${mockAlerts[index].id}"]`).should(
        'not.exist'
      );
    });
  });

  it('should disable and enable user alerts successfully', () => {
    // Function to search for an alert
    const searchAlert = (alertName: string) => {
      cy.findByPlaceholderText('Search for Alerts')
        .should('be.visible')
        .and('not.be.disabled')
        .clear();
      cy.findByPlaceholderText('Search for Alerts').type(alertName);

      cy.focused().click();
    };

    // Function to toggle an alert's status
    const toggleAlertStatus = (
      alertName: string,
      action: 'Disable' | 'Enable',
      alias: string,
      successMessage: string
    ) => {
      cy.findByText(alertName)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(`Action menu for Alert ${alertName}`)
            .should('be.visible')
            .click();
        });

      ui.actionMenuItem.findByTitle(action).should('be.visible').click();

      cy.wait(alias).then(({ response }) => {
        ui.toast.assertMessage(successMessage);
      });
    };
    // Disable "Alert-1"
    searchAlert('Alert-1');
    toggleAlertStatus(
      'Alert-1',
      'Disable',
      '@getFirstAlertDefinitions',
      OPTIMISTIC_SUCCESS_MESSAGE
    );

    // Enable "Alert-2"
    searchAlert('Alert-2');
    toggleAlertStatus(
      'Alert-2',
      'Enable',
      '@getSecondAlertDefinitions',
      OPTIMISTIC_SUCCESS_MESSAGE
    );
  });
});
