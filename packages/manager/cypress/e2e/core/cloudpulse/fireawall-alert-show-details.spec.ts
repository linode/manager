/**
 * @file Integration Tests for the CloudPulse Alerts Show Detail Page.
 *
 * This file contains Cypress tests that validate the display and content of the  Alerts Show Detail Page in the CloudPulse application.
 * It ensures that all alert details, criteria, and entity information are displayed correctly.
 */
import { capitalize, linodeFactory, profileFactory } from '@linode/utilities';
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
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';

import {
  accountFactory,
  alertFactory,
  firewallFactory,
  firewallMetricRulesFactory,
  notificationChannelFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
} from 'src/factories';
import {
  ACCOUNT_GROUP_INFO_MESSAGE,
  entityGroupingOptions,
} from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type {
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  Linode,
} from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();

const alertDetails = alertFactory.build({
  entity_ids: ['1'],
  rule_criteria: {
    rules: firewallMetricRulesFactory.buildList(5),
  },
  service_type: 'firewall',
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
const mockLinodes: Linode[] = [
  linodeFactory.build({
    id: 1,
    label: 'Linode 1',
    region: 'us-ord',
  }),
];

const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: 'firewall-linode-1',
    status: 'enabled',
    entities: [
      {
        id: 1,
        label: 'linode-1',
        type: 'linode',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
  firewallFactory.build({
    id: 2,
    label: 'firewall-linode_interface-2',
    status: 'enabled',
    entities: [
      {
        id: 2,
        label: 'linode_interface-2',
        type: 'linode_interface',
        url: '/test',
        parent_entity: {
          id: 1,
          label: 'linode-1',
          type: 'linode',
          url: '/parent-test',
          parent_entity: null,
        },
      },
    ],
  }),
  firewallFactory.build({
    id: 3,
    label: 'firewall-no-entities-3',
    status: 'enabled',
    entities: [],
  }),
  firewallFactory.build({
    id: 4,
    label: 'firewall-nodebalancer-4',
    status: 'enabled',
    entities: [
      {
        id: 4,
        label: 'nodebalancer-4',
        type: 'nodebalancer',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
];
/**
 * Integration tests for the CloudPulse Alerts Detail Page, ensuring that the alert details, criteria, and entity information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

// Define actions to validate alert details based on the grouping scope (Region or Account)
const scopeActions: Record<string, () => void> = {
  // ✅ Account-level alert validations
  Account: () => {
    cy.log('Validating Account-level alert details');
    cy.get('[data-qa-notice="true"]').within(() => {
      cy.get('[data-testid="alert_message_notice"]')
        .should('be.visible')
        .and('have.text', ACCOUNT_GROUP_INFO_MESSAGE);
    });
  },

  // ✅ Entity-level alert validations
  Entity: () => {
    cy.log('Validating Entity-level alert details');

    // Scope inside the Resources section
    cy.get('[data-qa-section="Resources"]').within(() => {
      // ✅ Table should exist
      cy.get('[data-qa-alert-table="true"]').should('exist');

      // ✅ Validate table header
      cy.get('[data-testid="entity"]')
        .should('be.visible')
        .and('contain.text', 'Entity');

      // ✅ Optional: test sorting before checking table body
      cy.get('[data-testid="entity"]').click(); // sort descending
      cy.get('[data-testid="entity"]').click(); // sort ascending

      // ✅ Validate table body and rows
      cy.get('[data-qa-alert-table-body="true"]').within(() => {
        const expectedEntities = [
          'firewall-linode-1',
          'firewall-linode_interface-2',
        ];

        // ✅ Validate number of rows
        cy.get('[data-qa-alert-row]').should(
          'have.length',
          expectedEntities.length
        );

        // ✅ Validate row entity text
        expectedEntities.forEach((entity, index) => {
          const rowNum = index + 1;
          cy.get(`[data-qa-alert-cell="${rowNum}_entity"]`)
            .should('be.visible')
            .and('have.text', entity);
        });

        // ✅ Sanity check for all visible entity cells
        cy.get('[data-qa-alert-row]').each(($row) => {
          cy.wrap($row)
            .find('[data-qa-alert-cell$="_entity"]')
            .should('be.visible');
        });
      });
    });
  },
};

describe('Integration Tests for Alert Show Detail Page', () => {
  entityGroupingOptions
    .filter(({ value }) => value !== 'region') // exclude Region scope for firewall
    .forEach(({ label: groupLabel, value }) => {
      it(`should correctly display the details of the firewall alert in the alert details view for ${groupLabel} level`, () => {
        const regionList = ['us-ord', 'us-east'];
        const alertDetails = alertFactory.build({
          alert_channels: [{ id: 1 }],
          created_by: 'user1',
          description: 'My Custom Description',
          entity_ids: ['1', '2'],
          label: 'Alert-1',
          rule_criteria: {
            rules: firewallMetricRulesFactory.buildList(5),
          },
          service_type: 'firewall',
          type: 'user',
          severity: 0,
          created: '2023-10-01T12:00:00Z',
          updated: new Date().toISOString(),
          trigger_conditions: triggerConditionFactory.build(),
          scope: value,
          ...(value === 'region' ? { regions: regionList } : {}),
        });
        const services = serviceTypesFactory.build({
          service_type: 'firewall',
          label: 'firewall',
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
        mockGetAllAlertDefinitions([alertDetails]).as(
          'getAlertDefinitionsList'
        );
        mockGetAlertDefinitions(service_type, id, alertDetails).as(
          'getDBaaSAlertDefinitions'
        );
        mockGetAlertChannels([notificationChannels]);
        mockGetAllAlertDefinitions([alertDetails]).as(
          'getAlertDefinitionsList'
        );
        mockGetAlertDefinitions(service_type, id, alertDetails).as(
          'getDBaaSAlertDefinitions'
        );
        mockGetCloudPulseServiceByType('Firewalls', services);
        mockCreateAlertDefinition('Firewalls', alertDetails).as(
          'createAlertDefinition'
        );
        cy.visitWithLogin(`/alerts/definitions/detail/${service_type}/${id}`);
        mockGetFirewalls(mockFirewalls);
        mockGetLinodes(mockLinodes);
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
          cy.findByText('Firewalls').should('be.visible');

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

        cy.log(`Executing validation for ${groupLabel} scope`);
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
