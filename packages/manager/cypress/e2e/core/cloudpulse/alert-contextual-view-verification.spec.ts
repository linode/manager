import { authenticate } from 'support/api/authentication';
/**
 * @file Integration Tests for contextual view of Entity Listing.
 */
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockAddEntityToAlert,
  mockDeleteEntityFromAlert,
  mockGetAlertDefinition,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';

import { accountFactory, alertFactory } from 'src/factories';

import type {
  AlertDefinitionType,
  AlertStatusType,
  MetricAggregationType,
} from '@linode/api-v4';
import type { RecPartial } from 'factory.ts';
import type { Flags } from 'src/featureFlags';

const serviceType = 'linode';
const ALERT_TYPE = 'alert-definition-id';

const mockAccount = accountFactory.build();

const alertConfigs = [
  {
    aggregate_function: 'avg' as RecPartial<MetricAggregationType>,
    created_by: 'user1',
    metric: 'CPU Usage',
    threshold: 55,
    type: 'system',
    status: 'enabled',
    scope: 'region',
  },
  {
    aggregate_function: 'min' as RecPartial<MetricAggregationType>,
    created_by: 'user2',
    metric: 'Memory Usage',
    threshold: 100,
    type: 'user',
    status: 'in progress',
    scope: 'account',
  },
  {
    aggregate_function: 'sum' as RecPartial<MetricAggregationType>,
    created_by: 'user3',
    metric: 'Disk Usage',
    threshold: 75,
    type: 'user',
    status: 'in progress',
    scope: 'entity',
  },
  {
    aggregate_function: 'max' as RecPartial<MetricAggregationType>,
    created_by: 'user4',
    metric: 'Network Usage',
    threshold: 90,
    type: 'system',
    status: 'enabled',
    scope: 'entity',
  },
  // below are the additional alert configurations and should show up in the table
  {
    aggregate_function: 'max' as RecPartial<MetricAggregationType>,
    created_by: 'user4',
    metric: 'Network Usage',
    threshold: 90,
    type: 'user',
    status: 'disabled',
    scope: 'entity',
  },
  {
    aggregate_function: 'max' as RecPartial<MetricAggregationType>,
    created_by: 'user4',
    metric: 'Network Usage',
    threshold: 90,
    type: 'user',
    status: 'failed',
    scope: 'entity',
  },
];
const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
      supportedRegionIds: 'us-ord',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};
const alerts = alertConfigs.flatMap((config) => {
  // Create the alert
  return alertFactory.build({
    created_by: config.created_by,
    entity_ids: ['1'],
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
    label: `Alert-${config.created_by.split('user')[1]}`,
    severity: 1,
    status: config.status as AlertStatusType,
    type: config.type as AlertDefinitionType,
    scope: config.scope as 'account' | 'entity' | 'region',
    service_type: 'linode',
  });
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
        .map((_, cell) => {
          const attribute = cell.getAttribute('data-qa-alert-cell');
          return attribute ? parseInt(attribute, 5) : NaN;
        })
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
  { ascending: [1, 4, 2, 3], column: 'type', descending: [2, 3, 1, 4] },
];

authenticate();
describe('update linode label', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');
  });

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
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      mockAppendFeatureFlags(flags);
      mockGetAccount(mockAccount);
      mockGetAlertDefinition(serviceType, alerts).as(
        'getDBaaSAlertDefinitions'
      );
      mockAddEntityToAlert(serviceType, '100', { [ALERT_TYPE]: 100 }).as(
        'addEntityToAlert'
      );
      mockGetAlertDefinition(serviceType, alerts).as(
        'getDBaaSAlertDefinitions'
      );
      mockDeleteEntityFromAlert(serviceType, '100', 4).as(
        'deleteEntityToAlert'
      );

      // Visit the database alerts page
      cy.visitWithLogin(`/linodes/${linode.id}/alerts`);

      // Navigation to Alerts beta
      ui.button.findByTitle('Try Alerts (Beta)').should('be.visible').click();

      cy.get('[data-qa-notice="true"]')
        .should('be.visible')
        .contains(
          'Welcome to Alerts (Beta) with more options and greater flexibility.'
        );

      // Test sorting
      sortCases.forEach(({ ascending, column, descending }) => {
        verifyTableSorting(column, 'descending', descending);
        verifyTableSorting(column, 'ascending', ascending);
      });
      ui.heading.findByText('scope').click();

      ui.buttonGroup.findButtonByTitle('Manage Alerts').should('be.visible');

      ui.tooltip
        .findByText(
          'Indicates whether the alert applies to all Linodes in the account, Linodes in specific regions, or just this Linode (entity).'
        )
        .should('be.visible');

      ui.tooltip
        .findByText(
          "Account-level alerts can't be enabled or disabled for a single entity."
        )
        .should('be.visible');

      ui.tooltip
        .findByText(
          "Region-level alerts can't be enabled or disabled for a single entity."
        )
        .should('be.visible');

      // Alert Links Verification
      [1, 2, 3, 4].forEach((id) => {
        cy.get(`[data-qa-alert-cell="${id}"]`).within(() => {
          cy.get('a')
            .should(
              'have.attr',
              'href',
              `/alerts/definitions/detail/${serviceType}/${id}`
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
      cy.findByPlaceholderText('Search for Alerts')
        .should('be.visible')
        .clear();

      // Select Alert Type Test
      cy.findByPlaceholderText('Select Alert Type')
        .should('be.visible')
        .type(`${alerts[0].type}{enter}`);
      cy.get(`[data-qa-alert-cell="${alerts[0].id}"]`).should('be.visible');
      [1, 3].forEach((index) =>
        cy.get(`[data-qa-alert-cell="${alerts[index].id}"]`).should('not.exist')
      );

      // check it is disabled as region should be un toggled
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'true')
        .should('be.visible')
        .should('be.disabled');

      // search for alert
      cy.get('[data-qa-alert-cell="4"]').should('exist');
      cy.findByPlaceholderText('Search for Alerts').type('Alert-4');

      // toggle the alert
      ui.toggle
        .find()
        .should('have.attr', 'data-qa-toggle', 'false')
        .should('be.visible')
        .click();

      ui.button.findByTitle('Save').should('be.visible').click();

      cy.get('button[data-testid="button"]').contains('Save').click();

      // Assert successful API call for disabling the alert
      ui.toast.assertMessage('Your settings for alerts have been saved.');
    });
  });
});
