import { linodeFactory, regionFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
/**
 * @file Integration Tests for contextual view of Entity Listing.
 */
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockAddEntityToAlert,
  mockDeleteEntityFromAlert,
  mockGetAlertDefinition,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, alertFactory, flagsFactory } from 'src/factories';

import type {
  AlertDefinitionType,
  AlertStatusType,
  Linode,
  MetricAggregationType,
} from '@linode/api-v4';
import type { RecPartial } from 'factory.ts';

const serviceType = 'linode';
const ALERT_TYPE = 'alert-definition-id';

const mockAccount = accountFactory.build();

const alertConfigs = [
  {
    aggregate_function: 'min' as RecPartial<MetricAggregationType>,
    created_by: 'user1',
    metric: 'CPU Usage',
    threshold: 55,
    type: 'system',
    status: 'provisioning',
    scope: 'account',
    id: 1,
  },
  {
    aggregate_function: 'min' as RecPartial<MetricAggregationType>,
    created_by: 'user2',
    metric: 'Memory Usage',
    threshold: 100,
    type: 'user',
    status: 'enabling',
    scope: 'account',
    id: 2,
  },
  {
    aggregate_function: 'sum' as RecPartial<MetricAggregationType>,
    created_by: 'user3',
    metric: 'Disk Usage',
    threshold: 75,
    type: 'user',
    status: 'enabling',
    scope: 'entity',
    id: 3,
  },
  {
    aggregate_function: 'max' as RecPartial<MetricAggregationType>,
    created_by: 'user4',
    metric: 'Network Usage',
    threshold: 90,
    type: 'system',
    status: 'in progress',
    scope: 'entity',
    id: 4,
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

const mockRegion = regionFactory.build({
  id: chooseRegion().id,
  label: chooseRegion().label,
  country: chooseRegion().country,
  capabilities: ['Linodes', 'Managed Databases', 'Cloud Firewall'],
  monitors: {
    metrics: [],
    alerts: ['Linodes', 'Managed Databases', 'Cloud Firewall'],
  },
});
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
    regions: [mockRegion.id],
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
  const mockLinodes = new Array(5).fill(null).map((): Linode => {
    return linodeFactory.build({
      label: chooseRegion().label,
      region: chooseRegion().id,
    });
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
  it('should verify sorting, alert management, and search functionality for contextual view of entity listing.', () => {
    cy.defer(() =>
      createTestLinode({ region: mockRegion.id, booted: true })
    ).then((linode) => {
      mockGetLinodes(mockLinodes);
      mockAppendFeatureFlags(flagsFactory.build());
      mockGetAccount(mockAccount);
      mockGetAlertDefinition(serviceType, alerts).as(
        'getDBaaSAlertDefinitions'
      );
      mockGetAllAlertDefinitions(alerts).as('getAlertDefinitionsList');

      mockAddEntityToAlert(serviceType, '100', { [ALERT_TYPE]: 100 }).as(
        'addEntityToAlert'
      );
      mockGetAlertDefinition(serviceType, alerts).as(
        'getDBaaSAlertDefinitions'
      );
      mockDeleteEntityFromAlert(serviceType, '100', 4).as(
        'deleteEntityToAlert'
      );
      mockGetRegions([mockRegion]);

      // Visit the database alerts page
      cy.visitWithLogin(`/linodes/${linode.id}/alerts`);

      // Navigation to Alerts beta
      ui.button.findByTitle('Try Alerts (Beta)').should('be.visible').click();

      cy.get('[data-qa-notice="true"]')
        .should('be.visible')
        .contains(
          'Welcome to Alerts (Beta), designed for flexibility with features like customizable alerts.'
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
          'Indicates whether the alert applies to all entities in the account, entities in specific regions, or just this entity.'
        )
        .should('be.visible');

      ui.tooltip
        .findByText(
          "Account-level alerts can't be enabled or disabled for a single entity."
        )
        .should('be.visible');

      // ui.tooltip
      //   .findByText(
      //     "Region-level alerts can't be enabled or disabled for a single entity."
      //   )
      //   .should('be.visible');

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
      ui.button.findByTitle('Confirm').should('be.visible').click();

      // Assert successful API call for disabling the alert
      ui.toast.assertMessage('Your settings for alerts have been saved.');
    });
  });
});
