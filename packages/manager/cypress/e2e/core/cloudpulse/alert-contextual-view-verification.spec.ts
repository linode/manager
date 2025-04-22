/**
 * @file Integration Tests for contextual view of Entity Listing.
 */
import { mockDatabaseNodeTypes } from 'support/constants/databases';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockAddEntityToAlert,
  mockDeleteEntityFromAlert,
  mockGetAlertDefinition,
} from 'support/intercepts/cloudpulse';
import {
  mockGetDatabase,
  mockGetDatabaseTypes,
} from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { accountFactory, alertFactory, databaseFactory } from 'src/factories';

import type {
  AlertDefinitionType,
  Database,
  MetricAggregationType,
} from '@linode/api-v4';
import type { RecPartial } from 'factory.ts';

const DBaaS = 'dbaas';
const ALERT_TYPE = 'alert-definition-id';

// Mock data
const { clusterName, engine, region } = widgetDetails.dbaas;
const mockAccount = accountFactory.build();
const databaseMock: Database = databaseFactory.build({
  cluster_size: 3,
  engine: 'mysql',
  id: 100,
  label: clusterName,
  region,
  status: 'active',
  type: engine,
});

const alertConfigs = [
  {
    aggregate_function: 'avg' as RecPartial<MetricAggregationType>,
    created_by: 'user1',
    metric: 'CPU Usage',
    threshold: 55,
    type: 'system',
  },
  {
    aggregate_function: 'min' as RecPartial<MetricAggregationType>,
    created_by: 'user2',
    metric: 'Memory Usage',
    threshold: 100,
    type: 'user',
  },
  {
    aggregate_function: 'sum' as RecPartial<MetricAggregationType>,
    created_by: 'user3',
    metric: 'Disk Usage',
    threshold: 75,
    type: 'system',
  },
  {
    aggregate_function: 'max' as RecPartial<MetricAggregationType>,
    created_by: 'user4',
    metric: 'Network Usage',
    threshold: 90,
    type: 'user',
  },
];
const alerts = alertConfigs.flatMap((config) => {
  // Create the alert
  const alert = alertFactory.build({
    created_by: config.created_by,
    entity_ids: ['1'],  // Default to ['1']
    rule_criteria: {
      rules: [
        {
          aggregate_function: config.aggregate_function,
          label: config.metric,
          metric: config.metric,
          operator: 'gt',
          threshold: config.threshold,
          unit: 'Bytes',
        },
      ],
    },
    service_type: DBaaS,
    severity: 1,
    status: 'enabled',
    type: config.type as AlertDefinitionType,
  });

  // Update the entity_ids if the label is 'alert-4'
  if (alert.label === 'Alert-4') {
    alert.entity_ids = ['100'];
    alert.type = 'system';
  }

  return alert;
});


// Verify Sorting Function
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
        .map((_, cell) => parseInt(cell.getAttribute('data-qa-alert-cell')!, 5))
        .get();
      expectedValues.forEach((value, index) =>
        expect(actualOrder[index]).to.equal(value)
      );
    });
  });
};

// Sorting cloums and expected values
const sortCases = [
  { ascending: [1, 2, 3, 4], column: 'label', descending: [4, 3, 2, 1] },
  { ascending: [1, 2, 3, 4], column: 'id', descending: [4, 3, 2, 1] },
  { ascending: [1, 3, 4, 2], column: 'type', descending: [2, 1, 3, 4] },
];

/*
 * - Mocks feature flags, account data, and necessary API calls for database alerts.
 * - Visits the database alerts page after login.
 * - Verifies that the correct tooltip message appears on the page.
 * - Verifies that the 'Manage Alerts' button is visible and accessible.
 * - Confirms that each alert in the table has a valid hyperlink with the correct ID and text.
 * - Simulates searching for alerts using the label and verifies that the corresponding alert is visible.
 * - Clears the search and confirms that all alerts are visible again.
 * - Filters alerts by type and confirms that only the relevant alerts are visible.
 * - Enables the first alert by checking the checkbox and clicking the "Enable" button.
 * - Asserts that the correct API response is received for enabling the alert and confirms success message.
 * - Disables the first alert by unchecking the checkbox and clicking the "Disable" button.
 * - Asserts that the correct API response is received for disabling the alert and confirms success message.
 * - Verifies that sorting by different columns (ID, label, type) works as expected with ascending and descending orders.
 */
// Reason: Checking by anantha
it.skip('should verify sorting, alert management, and search functionality for contextual view of entity listing.', () => {
  mockAppendFeatureFlags({ aclp: { beta: true, enabled: true } });
  mockGetAccount(mockAccount);
  mockGetDatabase(databaseMock).as('getDatabase');
  mockGetDatabaseTypes(mockDatabaseNodeTypes).as('getDatabaseTypes');
  mockGetAlertDefinition(DBaaS, alerts).as('getDBaaSAlertDefinitions');
  mockAddEntityToAlert(DBaaS, '100', { [ALERT_TYPE]: 100 }).as(
    'addEntityToAlert'
  );
  mockDeleteEntityFromAlert(DBaaS, '100', 4).as('deleteEntityToAlert');

  // Visit the database alerts page
  cy.visitWithLogin(
    `/databases/${databaseMock.engine}/${databaseMock.id}/alerts`
  );
  cy.wait('@getDBaaSAlertDefinitions');

  // Test sorting
  sortCases.forEach(({ ascending, column, descending }) => {
    verifyTableSorting(column, 'descending', descending);
    verifyTableSorting(column, 'ascending', ascending);
  });

  // Tooltip and UI Element Verifications
  ui.tooltip
    .findByText(
      'The list contains only the alerts enabled in the Monitor centralized view.'
    )
    .should('be.visible');
  ui.buttonGroup.findButtonByTitle('Manage Alerts').should('be.visible');

  // Alert Links Verification
  [1, 2, 3, 4].forEach((id) => {
    cy.get(`[data-qa-alert-cell="${id}"]`).within(() => {
      cy.get('a')
        .should(
          'have.attr',
          'href',
          `/alerts/definitions/detail/${DBaaS}/${id}`
        )
        .and('have.text', `Alert-${id}`);
    });
  });

  // Search Functionality Test
  cy.findByPlaceholderText('Search for Alerts')
    .should('be.visible')
    .type(alerts[0].label);
  cy.get(`[data-qa-alert-cell="${alerts[0].id}"]`).should('be.visible');
  [1, 2, 3].forEach((index) =>
    cy.get(`[data-qa-alert-cell="${alerts[index].id}"]`).should('not.exist')
  );

  // Clear Search
  cy.findByPlaceholderText('Search for Alerts').should('be.visible').clear();

  // Select Alert Type Test
  cy.findByPlaceholderText('Select Alert Type')
    .should('be.visible')
    .type(`${alerts[0].type}{enter}`);
  cy.get(`[data-qa-alert-cell="${alerts[0].id}"]`).should('be.visible');
  [1, 3].forEach((index) =>
    cy.get(`[data-qa-alert-cell="${alerts[index].id}"]`).should('not.exist')
  );

  // Enable Alert
  cy.get('[data-qa-alert-cell="1"]')
    .find('[data-qa-toggle="false"]')
    .find('[type="checkbox"]')
    .check();
  cy.get('[data-testid="button"]')
    .should('be.enabled')
    .contains('Enable')
    .click();

  // Assert successful API call for disabling the alert
  cy.wait('@addEntityToAlert').then(({ response }) => {
    expect(response).to.have.property('statusCode', 200);
    ui.toast.assertMessage(
      'The alert settings for mysql-cluster saved successfully.'
    );
  });

  cy.findByPlaceholderText('Search for Alerts').should('be.visible').type('Alert-4');
  // Disable Alert
  cy.get('[data-qa-alert-cell="4"]')
    .find('[data-qa-toggle="true"]')
    .find('[type="checkbox"]')
    .uncheck();
  cy.get('[data-testid="button"]')
    .should('be.enabled')
    .contains('Disable')
    .click();

  // Assert successful API call for disabling the alert
  cy.wait('@deleteEntityToAlert').then(({ response }) => {
    expect(response).to.have.property('statusCode', 200);
    ui.toast.assertMessage(
      'The alert settings for mysql-cluster saved successfully.'
    );
  });
});
