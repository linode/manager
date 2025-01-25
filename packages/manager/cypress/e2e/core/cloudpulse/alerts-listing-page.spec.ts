/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page.
 * This file contains integration tests to verify the functionality and UI elements
 * on the CloudPulse  Alerts Listing Page.
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

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };
const mockAccount = accountFactory.build();
const now = new Date();
const expectedHeaders = [
  'Alert Name',
  'Service',
  'Status',
  'Last Modified',
  'Created By',
];

const mockAlerts = [
  alertFactory.build({
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'system',
    created_by: 'user1',
    updated: new Date(now.getTime() - 1 * 86400).toISOString(),
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
 * Verifies the sorting functionality of a table column.
 *
 * This function:
 * - Clicks the specified column header to trigger sorting.
 * - Validates that the `aria-sort` attribute of the column header matches the given sort order.
 * - Extracts cell values from the table and compares their order with the expected values.
 *
 * @param {string} columnDataQa - The `data-qa-header` attribute of the column to be sorted.
 * @param {'ascending' | 'descending'} sortOrder - The expected sorting order ('ascending' or 'descending').
 * @param {number[]} expectedValues - An array of expected values to validate against the sorted column.
 */

const verifyTableSorting = (
  columnDataQa: string,
  sortOrder: 'ascending' | 'descending',
  expectedValues: number[]
) => {
  cy.get(`[data-qa-header="${columnDataQa}"]`)
    .should('have.attr', 'aria-sort', sortOrder)
    .click();

  cy.get('[data-qa="alert-table"]').within(() => {
    cy.get('[data-qa-alert-cell]').should(($cells) => {
      const actualOrder = $cells
        .map((_, cell) =>
          parseInt(cell.getAttribute('data-qa-alert-cell')!, 10)
        )
        .get();

      expect(actualOrder).to.deep.equal(expectedValues);
    });
  });
};

describe('Integration Tests for Dbaas Alert Listing Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices('linode', 'dbaas');
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    cy.visitWithLogin('/monitor/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');
  });

  /**
   * Function to check the details of an alert.
   * @param {Alert} alert - The alert object to check.
   */
  const checkAlertDetails = (alert: Alert) => {
    cy.get(`[data-qa-alert-cell="${alert.id}"]`).within(() => {
      cy.findByText(alert.service_type)
        .should('be.visible')
        .should('have.text', alert.service_type);

      cy.findByText(new RegExp(alert.status, 'i'))
        .should('be.visible')
        .should(
          'have.text',
          alert.status === 'enabled' ? 'Enabled' : 'Disabled'
        );
      cy.findByText(alert.label)
        .should('be.visible')
        .should('have.text', alert.label)
        .should(
          'have.attr',
          'href',
          `/monitor/alerts/definitions/detail/${alert.service_type}/${alert.id}`
        );

      cy.findByText(formatDate(alert.updated, { format: 'yyyy-MM-dd HH:mm' }))
        .should('be.visible')
        .should(
          'have.text',
          formatDate(alert.updated, { format: 'yyyy-MM-dd HH:mm' })
        );
      cy.findByText(alert.created_by)
        .should('be.visible')
        .should('have.text', alert.created_by);

      cy.get(`[data-qa-alert-action-cell="alert_${alert.id}"]`)
        .find('button')
        .should('be.visible')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
        .click();
    });
    cy.get('[data-qa-action-menu-item="Show Details"]').should('be.visible');

    cy.get('body').click();
  };

  it('should verify sorting for multiple columns in ascending and descending order', () => {
    // Verify sorting for 'label' column in ascending order
    verifyTableSorting('label', 'ascending', [4, 3, 2, 1]);

    // Verify sorting for 'label' column in descending order
    verifyTableSorting('label', 'descending', [1, 2, 3, 4]);

    // Verify sorting for 'status' column in ascending order
    verifyTableSorting('status', 'ascending', [1, 3, 2, 4]);

    // Verify sorting for 'status' column in descending order
    verifyTableSorting('status', 'descending', [2, 4, 1, 3]);

    // Verify sorting for 'service_type' column in ascending order
    verifyTableSorting('service_type', 'ascending', [4, 3, 2, 1]);

    // Verify sorting for 'service_type' column in descending order
    verifyTableSorting('service_type', 'descending', [2, 1, 4, 3]);

    // Verify sorting for 'created_by' column in ascending order
    verifyTableSorting('created_by', 'ascending', [2, 4, 3, 1]);

    // Verify sorting for 'created_by' column in descending order
    verifyTableSorting('created_by', 'descending', [1, 3, 4, 2]);

    // Verify sorting for 'created_by' column in ascending order
    verifyTableSorting('updated', 'ascending', [1, 4, 3, 2]);

    // Verify sorting for 'created_by' column in descending order
    verifyTableSorting('updated', 'descending', [2, 3, 4, 1]);
  });

  it('should validate the UI elements, headers, alert details, and search functionality', () => {
    // Validate 'Alerts' Link
    cy.findByText('Alerts')
      .should('be.visible')
      .should('have.attr', 'href', '/monitor/alerts')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      .should('have.css', 'font-family', 'LatoWebBold, sans-serif')
      .should('have.css', 'font-style', 'normal')
      .should('have.css', 'font-weight', '400')
      .should('have.css', 'font-size', '14.4px');

    // Validate 'Definitions' Link
    cy.findByText('Definitions')
      .should('be.visible')
      .and('have.attr', 'href', '/monitor/alerts/definitions')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      .should('have.css', 'font-family', 'LatoWebBold, sans-serif')
      .should('have.css', 'font-style', 'normal')
      .should('have.css', 'font-weight', '400')
      .should('have.css', 'font-size', '14.4px');

    // Check that the "Create Alert" button is visible
    ui.buttonGroup
      .findButtonByTitle('Create')
      .should('be.visible')
      .should('have.css', 'background-color', 'rgb(1, 116, 188)')
      .should('have.css', 'font-family', 'LatoWebBold, sans-serif')
      .should('have.css', 'font-style', 'normal')
      .should('have.css', 'font-weight', '500')
      .should('have.css', 'font-size', '16px');

    // Validate the headers of the alert listing page
    cy.get('[data-qa="alert-table"]').within(() => {
      expectedHeaders.forEach((headerText) => {
        cy.findByText(headerText).should('have.text', headerText);
      });
    });
    // Check each alert's details
    mockAlerts.forEach((alert) => {
      checkAlertDetails(alert);
    });
  });

  it('should search and filter alerts by name, service, and status, and clear filters', () => {
    //  Search by alert name and validate the results
    cy.findByPlaceholderText('Search for Alerts')
      .should('be.visible')
      .should('not.be.disabled')
      .type(mockAlerts[0].label);

    cy.get('[data-qa="alert-table"]')
      .should('have.length', 1)
      .find(`[data-qa-alert-cell="${mockAlerts[0].id}"]`)
      .within(() => {
        cy.findByText(mockAlerts[0].label).should(
          'have.text',
          mockAlerts[0].label
        );
      });

    //  Clear previous search by alert name
    cy.get('[data-qa-filter="alert-search"]').within(() => {
      cy.get('input[data-testid="textfield-input"]').click().clear();
    });

    //  Clear the search by service filter and search by service type
    cy.get('[data-qa-filter="alert-service-filter"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByAttribute('aria-label', 'Clear')
          .should('be.visible')
          .scrollIntoView()
          .click();
      });

    cy.findByPlaceholderText('Select a Service')
      .should('be.visible')
      .type(`${mockAlerts[0].service_type}{enter}`);

    // Clicks the currently focused element
    cy.focused().click();

    cy.get('[data-qa="alert-table"]')
      .find('[data-qa-alert-cell]')
      .should('have.length', 2);

    cy.get(`[data-qa-alert-cell="${mockAlerts[0].id}"]`).should('be.visible');
    cy.get(`[data-qa-alert-cell="${mockAlerts[1].id}"]`).should('be.visible');

    //  Clear search by alert status filter and search by alert status
    cy.get('[data-qa-filter="alert-status-filter"]')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByAttribute('aria-label', 'Clear')
          .should('be.visible')
          .scrollIntoView()
          .click();
      });

    cy.findByPlaceholderText('Select a Status')
      .should('be.visible')
      .type('Enabled{enter}');

    //  Assert the search results for alert status
    cy.get('[data-qa="alert-table"]')
      .find('[data-qa-alert-cell]')
      .should('have.length', 1);

    // Clicks the currently focused element
    cy.focused().click();

    cy.get(`[data-qa-alert-cell="${mockAlerts[0].id}"]`).should('be.visible');
  });
});
