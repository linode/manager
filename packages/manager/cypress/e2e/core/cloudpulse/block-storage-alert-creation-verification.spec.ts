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
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseServiceByType,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolumes } from 'support/intercepts/volumes';

import {
  accountFactory,
  alertFactory,
  blockStorageMetricCriteria,
  databaseFactory,
  notificationChannelFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
  volumeFactory,
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
const BLOCK_STORAGE_CAPABILITY = 'Block Storage';
const REGION_LABEL = 'Chicago, IL';

const regions = [
  regionFactory.build({
    capabilities: [BLOCK_STORAGE_CAPABILITY],
    country: 'us',
    id: 'us-ord',
    label: REGION_LABEL,
    monitors: { alerts: [BLOCK_STORAGE_CAPABILITY] },
  }),
  regionFactory.build({
    capabilities: [BLOCK_STORAGE_CAPABILITY],
    country: 'us',
    id: 'us-east',
    label: 'Newark',
    monitors: { alerts: [BLOCK_STORAGE_CAPABILITY] },
  }),
];

const databases: Database[] = databaseFactory.buildList(5).map((db, index) => ({
  ...db,
  region: regions[index % regions.length].id,
}));

const alertDetails = alertFactory.build({
  entity_ids: databases.slice(0, 4).map((db) => db.id.toString()),
  rule_criteria: {
    rules: [blockStorageMetricCriteria.build()],
  },

  service_type: 'blockstorage',
  severity: 1,
  status: 'enabled',
  type: 'user',
  created_by: 'user1',
  updated_by: 'user2',
  created: '2023-10-01T12:00:00Z',
  updated: new Date().toISOString(),
});
const { rule_criteria } = alertDetails;
const { rules } = rule_criteria;
const notificationChannels = notificationChannelFactory.build();

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
// Validate all rule blocks in Criteria section
export const assertRuleBlock = (rules: AlertDefinitionMetricCriteria[]) => {
  cy.get('[data-qa-section="Criteria"]').within(() => {
    rules.forEach((rule, index) => {
      // Validate Metric Threshold section
      cy.get('[data-qa-item="Metric Threshold"]')
        .eq(index)
        .within(() => {
          const aggLabel = aggregationTypeMap[rule.aggregate_function];
          const opLabel = metricOperatorTypeMap[rule.operator];

          cy.get(`[data-qa-chip="${aggLabel}"]`)
            .should('be.visible')
            .should('have.text', aggLabel);

          cy.get(`[data-qa-chip="${rule.label}"]`)
            .should('be.visible')
            .should('have.text', rule.label);

          cy.get(`[data-qa-chip="${opLabel}"]`)
            .should('be.visible')
            .should('have.text', opLabel);

          cy.get(`[data-qa-chip="${rule.threshold}"]`)
            .should('be.visible')
            .should('have.text', String(rule.threshold));

          cy.get(`[data-qa-chip="${rule.unit}"]`)
            .should('be.visible')
            .should('have.text', rule.unit);
        });

      // Validate Dimension Filters section
      cy.get('[data-qa-item="Dimension Filter"]')
        .eq(index)
        .within(() => {
          (rule.dimension_filters ?? []).forEach((filter) => {
            assertDimensionFilter(filter);
          });
        });
    });
  });
};

/**
 * Integration tests for the CloudPulse Alerts Detail Page, ensuring that the alert details, criteria, and entity information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Alert Show Detail Page', () => {
  // Define actions to validate alert details based on the grouping scope (Region or Account)
  const scopeActions: Record<string, () => void> = {
    Region: () => {
      cy.log('🌎 Validating Region scope view');

      cy.get('[data-qa-section="Resources"]').within(() => {
        // ✅ Verify section heading
        cy.contains('h2', 'Regions').should('be.visible');

        // ✅ Verify info notice
        cy.get('[data-qa-notice="true"] [data-testid="alert_message_notice"]')
          .should('be.visible')
          .and('have.text', REGION_GROUP_INFO_MESSAGE);

        // ✅ Verify region table
        const expectedRegions = [
          { id: 'us-ord', name: 'US, Chicago, IL (us-ord)', entities: '2' },
        ];

        cy.get('[data-qa="region-tabls"]').within(() => {
          // Verify column headers
          cy.get('[data-qa-header="Region"]').should('contain.text', 'Region');
          cy.get('[data-qa-header="associated-entities"]').should(
            'contain.text',
            'Associated Entities'
          );

          // ✅ Verify rows using testid
          expectedRegions.forEach(({ id, name, entities }) => {
            cy.get(`[data-testid="region-row-${id}"]`).within(() => {
              cy.get('td').eq(0).should('have.text', name);
              cy.get('td').eq(1).should('have.text', entities);
            });
          });

          // ✅ Optional: ensure row count matches
          cy.get('[data-testid^="region-row-"]').should(
            'have.length',
            expectedRegions.length
          );
        });
      });
    },

    Account: () => {
      cy.get('[data-qa-notice="true"]')
        .find('[data-testid="alert_message_notice"]')
        .should('have.text', ACCOUNT_GROUP_INFO_MESSAGE);
    },

    Entity: () => {
      const searchPlaceholder = 'Search for a Region or Entity';

      cy.log('📦 Validating Entity scope view');

      cy.get('[data-qa-section="Resources"]').within(() => {
        // ✅ Validate table headers
        cy.get('[data-qa-header="entity"]').should('contain.text', 'Entity');
        cy.get('[data-qa-header="region"]').should('contain.text', 'Region');

        // ✅ Validate search inputs
        cy.findByPlaceholderText(searchPlaceholder).should('be.visible');
        cy.findByPlaceholderText('Select Regions').should('be.visible');

        // ✅ Expected table data
        const expectedRows = [
          { entity: 'test-volume-ord', region: 'US, Chicago, IL (us-ord)' },
          { entity: 'test-volume-ord1', region: 'US, Chicago, IL (us-ord)' },
        ];

        // ✅ Verify rows count
        cy.get('[data-qa-alert-row]').should(
          'have.length',
          expectedRows.length
        );

        // ✅ Validate each row’s entity and region values
        expectedRows.forEach((row, i) => {
          const rowNumber = i + 1;
          cy.get(`[data-qa-alert-row="${rowNumber}"]`).within(() => {
            cy.get(`[data-qa-alert-cell="${rowNumber}_entity"]`)
              .should('be.visible')
              .and('have.text', row.entity);

            cy.get(`[data-qa-alert-cell="${rowNumber}_region"]`)
              .should('be.visible')
              .and('have.text', row.region);
          });
        });
      });
    },
  };

  const mockVolumesEncrypted = [
    volumeFactory.build({
      id: 1,
      label: 'test-volume-ord',
      region: 'us-ord', // Chicago
    }),
    volumeFactory.build({
      id: 2,
      label: 'test-volume-ord1',
      region: 'us-ord', // Chicago
    }),
    volumeFactory.build({
      id: 3,
      label: 'test-volume-west',
      region: 'us-west', // Fremont
    }),
    volumeFactory.build({
      id: 4,
      label: 'test-volume-eu',
      region: 'eu-central', // Frankfurt
    }),
  ];

  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`should correctly display the details of the blockstorage alert in the alert details view for ${groupLabel} level`, () => {
      const regionList = ['us-ord', 'us-east'];
      const alertDetails = alertFactory.build({
        alert_channels: [{ id: 1 }],
        created_by: 'user1',
        description: 'My Custom Description',
        entity_ids: ['1', '2', '3', '4'],
        label: 'Alert-1',
        rule_criteria: { rules: blockStorageMetricCriteria.buildList(5) },
        service_type: 'blockstorage',
        type: 'user',
        severity: 0,
        created: '2023-10-01T12:00:00Z',
        updated: new Date().toISOString(),
        trigger_conditions: triggerConditionFactory.build(),
        scope: value,
        ...(value === 'region' ? { regions: regionList } : {}),
      });
      const services = serviceTypesFactory.build({
        service_type: 'blockstorage',
        label: 'blockstorage',
        alert: serviceAlertFactory.build({
          evaluation_period_seconds: [300],
          polling_interval_seconds: [300],
          scope: [value],
        }),
        regions: 'us-ord',
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
      mockAppendFeatureFlags(flags);
      mockGetAccount(mockAccount);
      mockGetProfile(mockProfile);
      mockGetRegions(regions);
      mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
      mockGetAlertDefinitions(service_type, id, alertDetails).as(
        'getDBaaSAlertDefinitions'
      );
      mockGetVolumes(mockVolumesEncrypted);
      mockGetDatabases(databases).as('getMockedDbaasDatabases');
      mockGetAlertChannels([notificationChannels]);
      mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
      mockGetAlertDefinitions(service_type, id, alertDetails).as(
        'getDBaaSAlertDefinitions'
      );
      mockGetCloudPulseServiceByType('blockstorage', services);
      mockCreateAlertDefinition('blockstorage', alertDetails).as(
        'createAlertDefinition'
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
        cy.findByText('blockstorage').should('be.visible');

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
        .should('have.text', '5 min');

      // Validating contents of Evaluation Periods
      cy.get('[data-qa-item="Evaluation Period"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '5 min');

      // Validating contents of Trigger Alert
      cy.get('[data-qa-chip="All"]')
        .should('be.visible')
        .should('have.text', 'All');

      cy.get('[data-qa-chip="5 min"]')
        .should('be.visible')
        .should('contain.text', '5 min');

      cy.get('[data-qa-item="criteria are met for"]')
        .should('be.visible')
        .should('have.text', 'criteria are met for');

      cy.get('[data-qa-item="consecutive occurrences"]')
        .should('be.visible')
        .should('have.text', 'consecutive occurrences.');
      // Execute the appropriate validation logic based on the alert's grouping label (e.g., 'Region' or 'Account')

      cy.log(`Validating ${groupLabel} level specific details`);
      scopeActions[groupLabel]?.();
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
