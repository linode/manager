/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page.
 * This file verifies the UI, functionality, and sorting/filtering of the CloudPulse Alerts Listing Page.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { accountFactory, alertFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';
import {
  mockGetAllAlertDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { formatDate } from 'src/utilities/formatDate';
import { Alert } from '@linode/api-v4';
import { ui } from 'support/ui';
import { alertStatuses } from 'src/features/CloudPulse/Alerts/constants';
import { cloudPulseServiceMap } from 'support/constants/cloudpulse';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };
const mockAccount = accountFactory.build();
const now = new Date();
const mockAlerts = [
  alertFactory.build({
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'system',
    created_by: 'user1',
    updated: new Date(now.getTime() - 86400).toISOString(),
  }),
  alertFactory.build({
    service_type: 'dbaas',
    severity: 0,
    status: 'disabled',
    updated: new Date(now.getTime() - 10 * 86400).toISOString(),
    created_by: 'user4',
  }),
  alertFactory.build({
    service_type: 'linode',
    severity: 2,
    status: 'enabled',
    updated: new Date(now.getTime() - 6 * 86400).toISOString(),
    created_by: 'user2',
  }),
  alertFactory.build({
    service_type: 'linode',
    severity: 3,
    status: 'disabled',
    type: 'user',
    updated: new Date(now.getTime() - 4 * 86400).toISOString(),
    created_by: 'user3',
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
  ui.heading
    .findByText(header)
    .click()
    .should('have.attr', 'aria-sort', sortOrder);

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
  const { id, service_type, status, label, updated, created_by } = alert;

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
        `/monitor/alerts/definitions/detail/${service_type}/${id}`
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
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(['linode', 'dbaas']);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    cy.visitWithLogin('/monitor/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');
  });

  it('should verify sorting functionality for multiple columns in ascending and descending order', () => {
    const sortCases = [
      { column: 'label', descending: [4, 3, 2, 1], ascending: [1, 2, 3, 4] },
      { column: 'status', descending: [1, 3, 2, 4], ascending: [2, 4, 1, 3] },
      {
        column: 'service_type',
        descending: [4, 3, 2, 1],
        ascending: [2, 1, 4, 3],
      },
      {
        column: 'created_by',
        descending: [2, 4, 3, 1],
        ascending: [1, 3, 4, 2],
      },
      { column: 'updated', descending: [1, 4, 3, 2], ascending: [2, 3, 4, 1] },
    ];

    sortCases.forEach(({ column, descending, ascending }) => {
      // Verify descending order
      verifyTableSorting(column, 'descending', descending);

      // Verify ascending order
      verifyTableSorting(column, 'ascending', ascending);
    });
  });

  it('should validate UI elements and alert details', () => {
    // Validate navigation links and buttons
    cy.findByText('Alerts')
      .should('be.visible')
      .and('have.attr', 'href', '/monitor/alerts');
    cy.findByText('Definitions')
      .should('be.visible')
      .and('have.attr', 'href', '/monitor/alerts/definitions');
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
        .scrollIntoView()
        .click();
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
});
