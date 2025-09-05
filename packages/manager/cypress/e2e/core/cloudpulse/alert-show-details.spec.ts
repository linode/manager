/**
 * @file Integration Tests for the CloudPulse Alerts Show Detail Page.
 *
 * This file contains Cypress tests that validate the display and content of the  Alerts Show Detail Page in the CloudPulse application.
 * It ensures that all alert details, criteria, and entity information are displayed correctly.
 */
import { capitalize, profileFactory, regionFactory } from '@linode/utilities';
import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
  severityMap,
} from 'support/constants/alert';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  alertRulesFactory,
  databaseFactory,
  notificationChannelFactory,
} from 'src/factories';
import {
  ACCOUNT_GROUP_INFO_MESSAGE,
  entityGroupingOptions,
  REGION_GROUP_INFO_MESSAGE,
} from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type {
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  Database,
} from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    country: 'us',
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    country: 'us',
    id: 'us-east',
    label: 'Newark',
  }),
];

const databases: Database[] = databaseFactory.buildList(5).map((db, index) => ({
  ...db,
  engine: 'mysql',
  region: regions[index % regions.length].id,
  type: 'MySQL',
}));

const alertDetails = alertFactory.build({
  entity_ids: databases.slice(0, 4).map((db) => db.id.toString()),
  rule_criteria: { rules: alertRulesFactory.buildList(2) },
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'user',
  created_by: 'user1',
  updated_by: 'user2',
  created: '2023-10-01T12:00:00Z',
  updated: new Date().toISOString(),
});
const { id, label, rule_criteria, service_type } = alertDetails;
const { rules } = rule_criteria;
const notificationChannels = notificationChannelFactory.build();

const verifyRowOrder = (expectedIds: string[]) => {
  cy.get('[data-qa-alert-row]').then(($rows) => {
    const alertRowIds = $rows
      .map((index, row) => row.getAttribute('data-qa-alert-row'))
      .get();
    expectedIds.forEach((expectedId, index) => {
      expect(alertRowIds[index]).to.equal(expectedId);
    });
  });
};
const mockProfile = profileFactory.build({
  timezone: 'gmt',
});

/**
 * Asserts that the given dimension filter's label, operator, and value
 * are correctly displayed in the UI as visible chips.
 *
 * @param {AlertDefinitionDimensionFilter} filter - The dimension filter object containing
 *   the label (string), operator (string), and value (string) to validate.
 */
const assertDimensionFilter = (filter: AlertDefinitionDimensionFilter) => {
  cy.get(`[data-qa-chip="${filter.label}"]`)
    .should('be.visible')
    .each(($chip) => {
      expect($chip).to.have.text(filter.label);
    });

  cy.get(`[data-qa-chip="${dimensionOperatorTypeMap[filter.operator]}"]`)
    .should('be.visible')
    .each(($chip) => {
      expect($chip).to.have.text(dimensionOperatorTypeMap[filter.operator]);
    });

  cy.get(`[data-qa-chip="${capitalize(filter.value)}"]`)
    .should('be.visible')
    .each(($chip) => {
      expect($chip).to.have.text(capitalize(filter.value));
    });
};
/**
 * Validates the UI display of an array of metric criteria rules.
 *
 * For each rule, it checks the Metric Threshold section and the Dimension Filters section,
 * ensuring all expected chips are visible and have the correct text.
 *
 * @param {AlertDefinitionMetricCriteria[]} rules - Array of metric criteria objects,
 *   each containing properties such as aggregate_function, label, operator, threshold,
 *   unit, and optional dimension_filters to validate.
 */
const assertRuleBlock = (rules: AlertDefinitionMetricCriteria[]) => {
  cy.get('[data-qa-section="Criteria"]').within(() => {
    rules.forEach((rule, index) => {
      // Validate Metric Threshold section
      cy.get('[data-qa-item="Metric Threshold"]')
        .eq(index)
        .within(() => {
          cy.get(
            `[data-qa-chip="${aggregationTypeMap[rule.aggregate_function]}"]`
          )
            .should('be.visible')
            .should('have.text', aggregationTypeMap[rule.aggregate_function]);

          cy.get(`[data-qa-chip="${rule.label}"]`)
            .should('be.visible')
            .should('have.text', rule.label);

          cy.get(`[data-qa-chip="${metricOperatorTypeMap[rule.operator]}"]`)
            .should('be.visible')
            .should('have.text', metricOperatorTypeMap[rule.operator]);

          cy.get(`[data-qa-chip="${rule.threshold}"]`)
            .should('be.visible')
            .should('have.text', rule.threshold);

          cy.get(`[data-qa-chip="${rule.unit}"]`)
            .should('be.visible')
            .should('have.text', rule.unit);
        });

      // Validate Dimension Filters section
      cy.get('[data-qa-item="Dimension Filter"]')
        .eq(index)
        .within(() => {
          (rule.dimension_filters ?? []).forEach(assertDimensionFilter);
        });
    });
  });
};

/**
 * Integration tests for the CloudPulse Alerts Detail Page, ensuring that the alert details, criteria, and entity information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Alert Show Detail Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetProfile(mockProfile);
    mockGetRegions(regions);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getDBaaSAlertDefinitions'
    );
    mockGetDatabases(databases).as('getMockedDbaasDatabases');
    mockGetAlertChannels([notificationChannels]);
  });

  it('navigates to the Show Details page from the list page', () => {
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/alerts/definitions');

    // Wait for the alert definitions list API call to complete
    cy.wait('@getAlertDefinitionsList');

    // Locate the alert with the specified label in the table
    cy.findByText(label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(`Action menu for Alert ${label}`)
          .should('be.visible')
          .click();
        // Select the "Show Details" option from the action menu
        ui.actionMenuItem
          .findByTitle('Show Details')
          .should('be.visible')
          .click();
      });

    // Verify the URL ends with the expected details page path
    cy.url().should('endWith', `/detail/${service_type}/${id}`);
  });

  it('displays failure message and alert details for a failed alert', () => {
    const alertDetails = alertFactory.build({
      service_type: 'dbaas',
      status: 'failed',
      type: 'user',
      id: 1001,
      label: 'Alert-1',
    });
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions('dbaas', 1001, alertDetails).as(
      'getDBaaSAlertDefinitions'
    );
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/alerts/definitions/detail/dbaas/1001');
    cy.wait('@getDBaaSAlertDefinitions');

    cy.get('[data-qa-error="true"]')
      .should('be.visible')
      .should(
        'have.text',
        'Alert-1 alert creation has failed. Please open a support ticket for assistance.'
      );
    // Validate Status field
    cy.findByText('Status:').should('be.visible');
    cy.findByText('Failed').should('be.visible');
  });

  // Define actions to validate alert details based on the grouping scope (Region or Account)
  const scopeActions: Record<string, () => void> = {
    // Region-level alert validations
    Region: () => {
      cy.get('[data-qa="region-tabls"]').within(() => {
        const expectedRegions = [
          'US, Chicago, IL (us-ord)',
          'US, Newark (us-east)',
        ];

        expectedRegions.forEach((region) => {
          cy.contains('tr', region).should('exist');
        });
      });

      cy.get('[data-qa-notice="true"]')
        .find('[data-testid="alert_message_notice"]')
        .should('have.text', REGION_GROUP_INFO_MESSAGE);
    },
    // Account-level alert validations
    Account: () => {
      cy.get('[data-qa-notice="true"]')
        .find('[data-testid="alert_message_notice"]')
        .should('have.text', ACCOUNT_GROUP_INFO_MESSAGE);
    },
    // Entity-level alert validations
    Entity: () => {
      const searchPlaceholder = 'Search for a Region or Entity';
      cy.get('[data-qa-section="Resources"]').within(() => {
        // Validate headings
        ui.heading
          .findByText('entity')
          .scrollIntoView()
          .should('be.visible')
          .should('have.text', 'Entity');

        ui.heading
          .findByText('region')
          .should('be.visible')
          .should('have.text', 'Region');

        // Validate search inputs
        cy.findByPlaceholderText(searchPlaceholder).should('be.visible');
        cy.findByPlaceholderText('Select Regions').should('be.visible');

        // Assert row count
        cy.get('[data-qa-alert-row]').should('have.length', 4);

        // Validate entity-region mapping
        const regionMap = new Map(regions.map((r) => [r.id, r.label]));

        cy.get('[data-qa-alert-row]')
          .should('have.length', 4)
          .each((row, index) => {
            const db = databases[index];
            const rowNumber = index + 1;
            const regionLabel = regionMap.get(db.region) || 'Unknown Region';

            cy.wrap(row).within(() => {
              cy.get(`[data-qa-alert-cell="${rowNumber}_entity"]`).should(
                'have.text',
                db.label
              );

              cy.get(`[data-qa-alert-cell="${rowNumber}_region"]`).should(
                'have.text',
                `US, ${regionLabel} (${db.region})`
              );
            });
          });

        // Sorting validations
        ui.heading.findByText('entity').click();
        verifyRowOrder(['4', '3', '2', '1']);

        ui.heading.findByText('entity').click();
        verifyRowOrder(['1', '2', '3', '4']);

        ui.heading.findByText('region').click();
        verifyRowOrder(['2', '4', '1', '3']);

        ui.heading.findByText('region').click();
        verifyRowOrder(['1', '3', '2', '4']);

        // Entity search
        cy.findByPlaceholderText(searchPlaceholder).type(databases[0].label);

        cy.get('[data-qa-alert-table="true"]')
          .find('[data-qa-alert-row]')
          .should('have.length', 1);

        cy.findByText(databases[0].label).should('be.visible');
        [1, 2, 3].forEach((i) =>
          cy.findByText(databases[i].label).should('not.exist')
        );

        // Region filter
        cy.findByPlaceholderText(searchPlaceholder).clear();
        ui.regionSelect
          .find()
          .click()
          .type(`${regions[0].label}{enter}`)
          .click();

        cy.get('[data-qa-alert-table="true"]')
          .find('[data-qa-alert-row]')
          .should('have.length', 2);

        [0, 2].forEach((i) =>
          cy.get(`[data-qa-alert-cell="${i}_region"]`).should('not.exist')
        );

        [1, 3].forEach((i) =>
          cy.get(`[data-qa-alert-cell="${i}_region"]`).should('be.visible')
        );
      });
    },
  };

  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`should correctly display the details of the DBaaS alert in the alert details view for ${groupLabel} level`, () => {
      const regionList = ['us-ord', 'us-east'];
      const alertDetails = alertFactory.build({
        id: 2,
        label: 'Alert-1',
        entity_ids: databases.slice(0, 4).map((db) => db.id.toString()),
        rule_criteria: { rules: alertRulesFactory.buildList(2) },
        service_type: 'dbaas',
        severity: 1,
        status: 'enabled',
        type: 'user',
        created_by: 'user1',
        updated_by: 'user2',
        created: '2023-10-01T12:00:00Z',
        updated: new Date().toISOString(),
        scope: value,
        ...(value === 'region' ? { regions: regionList } : {}),
      });
      const {
        created_by,
        description,
        id,
        label,
        service_type,
        severity,
        created,
        updated,
      } = alertDetails;
      mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
      mockGetAlertDefinitions(service_type, id, alertDetails).as(
        'getDBaaSAlertDefinitions'
      );
      cy.visitWithLogin(`/alerts/definitions/detail/${service_type}/${id}`);
      cy.wait(['@getDBaaSAlertDefinitions']);

      // Validating contents of Overview Section
      cy.get('[data-qa-section="Overview"]').within(() => {
        // Validate Name field
        cy.findByText('Name:').should('be.visible');
        cy.findByText(label).should('be.visible');

        // Validate Description field
        cy.findByText('Description:').should('be.visible');
        cy.findByText(description).should('be.visible');

        // Validate Status field
        cy.findByText('Status:').should('be.visible');
        cy.findByText('Enabled').should('be.visible');

        cy.findByText('Severity:').should('be.visible');
        cy.findByText(severityMap[severity]).should('be.visible');

        // Validate Service field
        cy.findByText('Service:').should('be.visible');
        cy.findByText('Databases').should('be.visible');

        // Validate Type field
        cy.findByText('Type:').should('be.visible');
        cy.findByText('User').should('be.visible');

        // Validate Created By field
        cy.findByText('Created By:').should('be.visible');
        cy.findByText(created_by).should('be.visible');

        // Validate Last Modified field
        cy.findByText('Last Modified:').should('be.visible');
        cy.findByText(
          formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: 'GMT',
          })
        ).should('be.visible');
        cy.findByText(
          formatDate(created, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: 'GMT',
          })
        ).should('be.visible');

        cy.findByText('Scope:').should('be.visible');
        cy.findByText(groupLabel).should('be.visible');
      });
      // Validate the Criteria section by checking each metric rule's threshold details
      // and all related dimension filters for correct visibility and text content.
      assertRuleBlock(rules);
      // Validating contents of Polling Interval
      cy.get('[data-qa-item="Polling Interval"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '10 minutes');

      // Validating contents of Evaluation Periods
      cy.get('[data-qa-item="Evaluation Period"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '5 minutes');

      // Validating contents of Trigger Alert
      cy.get('[data-qa-chip="All"]')
        .should('be.visible')
        .should('have.text', 'All');

      cy.get('[data-qa-chip="5 minutes"]')
        .should('be.visible')
        .should('have.text', '5 minutes');

      cy.get('[data-qa-item="criteria are met for"]')
        .should('be.visible')
        .should('have.text', 'criteria are met for');

      cy.get('[data-qa-item="consecutive occurrences"]')
        .should('be.visible')
        .should('have.text', 'consecutive occurrences.');
      // Execute the appropriate validation logic based on the alert's grouping label (e.g., 'Region' or 'Account')

      scopeActions[label];
      // Validate Notification Channels Section
      cy.get('[data-qa-section="Notification Channels"]').within(() => {
        cy.findByText('Type:').should('be.visible');
        cy.findByText('Email').should('be.visible');
        cy.findByText('Channel:').should('be.visible');
        cy.findByText('Channel-1').should('be.visible');
        cy.findByText('To:').should('be.visible');
        cy.findByText('test@test.com').should('be.visible');
        cy.findByText('test2@test.com').should('be.visible');
      });
    });
  });
});
