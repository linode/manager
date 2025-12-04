/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 */
import {
  nodeBalancerFactory,
  profileFactory,
  regionFactory,
} from '@linode/utilities';
import { statusMap } from 'support/constants/alert';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServiceByType,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  dashboardMetricFactory,
  databaseFactory,
  egressTrafficRateRulesFactory,
  flagsFactory,
  ingressTrafficRateRulesFactory,
  newSessionsRulesFactory,
  notificationChannelFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  totalActiveBackendsRulesFactory,
  totalActiveSessionsRulesFactory,
  triggerConditionFactory,
} from 'src/factories';
import { CREATE_ALERT_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { entityGroupingOptions } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

export interface MetricDetails {
  aggregationType: string;
  dataField: string;
  operator: string;
  ruleIndex: number;
  threshold: string;
}

// Create mock data
const mockAccount = accountFactory.build();
const mockRegions = [
  regionFactory.build({
    id: 'us-ord',
    label: 'Chicago, IL',
    capabilities: ['NodeBalancers'],
    monitors: {
      alerts: ['Linodes', 'Managed Databases', 'NodeBalancers'],
      metrics: [],
    },
  }),
  regionFactory.build({
    id: 'us-east',
    label: 'New York, NY',
    capabilities: ['NodeBalancers'],
    monitors: {
      alerts: ['Linodes', 'Managed Databases', 'NodeBalancers'],
      metrics: [],
    },
  }),
];
const serviceType = 'nodebalancer';
const regionList = ['us-ord', 'us-east'];

const databaseMock = regionList.map((region) =>
  databaseFactory.build({
    engine: 'mysql',
    region,
  })
);

const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  id: 1,
  label: 'channel-1',
  type: 'user',
});

const customAlertDefinition = alertDefinitionFactory.build({
  channel_ids: [1],
  description: 'My Custom Description',
  entity_ids: ['2'],
  label: 'Alert-1',
  rule_criteria: {
    rules: [
      ingressTrafficRateRulesFactory.build(),
      egressTrafficRateRulesFactory.build(),
      newSessionsRulesFactory.build(),
      totalActiveSessionsRulesFactory.build(),
      totalActiveBackendsRulesFactory.build(),
    ],
  },
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
});

const metricDefinitionData = [
  {
    title: 'Ingress Traffic Rate',
    name: 'nb_ingress_traffic_rate',
    unit: 'bytes_per_second',
  },
  {
    title: 'Egress Traffic Rate',
    name: 'nb_egress_traffic_rate',
    unit: 'bytes_per_second',
  },

  {
    title: 'Total Active Sessions',
    name: 'nb_total_active_sessions',
    unit: 'count',
  },
  {
    title: 'New Sessions',
    name: 'nb_new_sessions_per_second',
    unit: 'sessions_per_second',
  },

  {
    title: 'Total Active Backends',
    name: 'nb_total_active_backends',
    unit: 'count',
  },
];

const metricDefinitions = metricDefinitionData.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [
      {
        dimension_label: 'port',
        label: 'port',
        values: [],
      },
      {
        dimension_label: 'protocol',
        label: 'protocol',
        values: ['TCP', 'UDP'],
      },
      {
        dimension_label: 'Configuration',
        label: 'Configuration',
        values: [],
      },
    ],
  })
);
const mockProfile = profileFactory.build({
  timezone: 'utc',
});
const mockAlerts = alertFactory.build({
  label: 'Alert-1',
  service_type: 'nodebalancer',
  entity_ids: ['2'],
});
const mockNodeBalancer = nodeBalancerFactory.build({
  label: 'NodeBalancer-1',
  id: 2,
  region: 'us-east',
});
const CREATE_ALERT_PAGE_URL = '/alerts/definitions/create';
/**
 * Fills metric details in the form.
 * @param ruleIndex - The index of the rule to fill.
 * @param dataField - The metric's data field (e.g., "CPU Utilization").
 * @param aggregationType - The aggregation type (e.g., "Average").
 * @param operator - The operator (e.g., ">=", "==").
 * @param threshold - The threshold value for the metric.
 */
const fillMetricDetailsForSpecificRule = ({
  aggregationType,
  dataField,
  operator,
  ruleIndex,
  threshold,
}: MetricDetails) => {
  cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
    // Fill Data Field
    ui.autocomplete
      .findByLabel('Data Field')
      .should('be.visible')
      .type(dataField);

    ui.autocompletePopper.findByTitle(dataField).should('be.visible').click();

    // Validate Aggregation Type
    ui.autocomplete
      .findByLabel('Aggregation Type')
      .should('be.visible')
      .type(aggregationType);

    ui.autocompletePopper
      .findByTitle(aggregationType)
      .should('be.visible')
      .click();

    // Fill Operator
    ui.autocomplete.findByLabel('Operator').should('be.visible').type(operator);

    ui.autocompletePopper.findByTitle(operator).should('be.visible').click();

    // Fill Threshold
    cy.get('[data-qa-threshold]').should('be.visible').clear();
    cy.get('[data-qa-threshold]').should('be.visible').type(threshold);
  });
};
/**
 * Verifies that a specific alert row in the alert definitions table is correctly displayed.
 *
 * This function locates the row by the given alert label, then asserts the presence and
 * visibility of key values including the status (mapped through `statusMap`), service type,
 * creator, and the formatted update date.
 *
 * @param label - The label of the alert to find in the table.
 * @param status - The raw status key to be mapped using `statusMap`.
 * @param statusMap - A mapping of raw status keys to human-readable status strings.
 * @param createdBy - The username of the user who created the alert.
 * @param updated - The ISO timestamp string indicating when the alert was last updated.
 */
const verifyAlertRow = (
  label: string,
  status: string,
  statusMap: Record<string, string>,
  createdBy: string,
  updated: string
) => {
  cy.findByText(label)
    .closest('tr')
    .should('exist')
    .then(($row) => {
      cy.wrap($row).within(() => {
        cy.findByText(label).should('be.visible');
        cy.findByText(statusMap[status]).should('be.visible');
        cy.findByText('NodeBalancer').should('be.visible');
        cy.findByText(createdBy).should('be.visible');
        cy.findByText(
          formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: 'GMT',
          })
        ).should('be.visible');
      });
    });
};

describe('Create Alert', () => {
  /*
   * - Confirms that users can navigate from the Alert Listings page to the Create Alert page.
   * - Confirms that users can enter alert details, select entities, and configure conditions.
   * - Confirms that the UI allows adding notification channels and setting thresholds.
   * - Confirms client-side validation when entering invalid metric values.
   * - Confirms that API interactions work correctly and return the expected responses.
   * - Confirms that the UI displays a success message after creating an alert.
   */
  // entityScopingOptions is an array of predefined scoping strategies for alert definitions.
  // Each item in the array represents a way to scope entities when generating or organizing alerts.
  // The scoping strategies include 'Per Account', 'Per Entity', and 'Per Region'.
  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`should successfully create a new alert for ${groupLabel} level`, () => {
      const alerts = alertFactory.build({
        alert_channels: [{ id: 1 }],
        created_by: 'user1',
        description: 'My Custom Description',
        label: 'Alert-1',
        entity_ids: ['2'],
        rule_criteria: {
          rules: [
            ingressTrafficRateRulesFactory.build(),
            egressTrafficRateRulesFactory.build(),
          ],
        },
        service_type: 'nodebalancer',
        severity: 0,
        tags: [''],
        trigger_conditions: triggerConditionFactory.build(),
        scope: value,
        ...(value === 'region' ? { regions: regionList } : {}),
      });
      const services = serviceTypesFactory.build({
        service_type: serviceType,
        label: serviceType,
        alert: serviceAlertFactory.build({
          evaluation_period_seconds: [300],
          polling_interval_seconds: [300],
          scope: [value],
        }),
        regions: 'us-ord,us-east',
      });
      mockAppendFeatureFlags(flagsFactory.build());
      mockGetAccount(mockAccount);
      mockGetProfile(mockProfile);
      mockGetCloudPulseServices([serviceType]);
      mockGetRegions(mockRegions);
      mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
      mockGetDatabases(databaseMock);
      mockGetNodeBalancers([mockNodeBalancer]);
      mockGetAllAlertDefinitions([mockAlerts]).as('getAlertDefinitionsList');
      mockGetAlertChannels([notificationChannels]);
      mockGetCloudPulseServiceByType(serviceType, services);
      mockGetAllAlertDefinitions([alerts]).as('getAlertDefinitionsList');
      mockCreateAlertDefinition(serviceType, alerts).as(
        'createAlertDefinition'
      );

      cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
      // Fill in Name and Description
      cy.findByPlaceholderText('Enter a Name').type(alerts.label);
      cy.findByPlaceholderText('Enter a Description').type(
        alerts.description || ''
      );

      // Fill in Service and Severity
      ui.autocomplete.findByLabel('Service').type('NodeBalancer');
      ui.autocompletePopper.findByTitle('NodeBalancer').click();
      ui.tooltip.findByText(
        'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.'
      );

      ui.autocomplete.findByLabel('Severity').type('Severe');
      ui.autocompletePopper.findByTitle('Severe').click();

      ui.tooltip.findByText(
        'The set of entities to which the alert applies: account-wide, specific regions, or individual entities.'
      );

      ui.autocomplete
        .findByLabel('Scope')
        .should('be.visible')
        .clear()
        .type(groupLabel);

      ui.autocompletePopper
        .findByTitle(groupLabel)
        .should('be.visible')
        .click();

      groupLabel !== 'Account' &&
        cy.get('[data-testid="select_all_notice"]').click();
      // Fill metric details for the first rule
      const ingressMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'Ingress Traffic Rate',
        operator: '=',
        ruleIndex: 0,
        threshold: '1000',
      };

      fillMetricDetailsForSpecificRule(ingressMetricDetails);

      // Add metrics
      cy.findByRole('button', { name: 'Add metric' })
        .should('be.visible')
        .click();

      ui.buttonGroup
        .findButtonByTitle('Add dimension filter')
        .should('be.visible')
        .click();

      ui.autocomplete
        .findByLabel('Data Field')
        .eq(1)
        .should('be.visible')
        .clear();

      ui.autocomplete
        .findByLabel('Data Field')
        .eq(1)
        .should('be.visible')
        .type('port');

      cy.findByText('port').should('be.visible').click();

      ui.autocomplete
        .findByLabel('Operator')
        .eq(1)
        .should('be.visible')
        .clear();

      ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');

      cy.findByText('Equal').should('be.visible').click();

      cy.findByPlaceholderText('e.g., 80').should('be.visible').type('1');

      ui.buttonGroup
        .findButtonByTitle('Add dimension filter')
        .should('be.visible')
        .click();

      ui.autocomplete
        .findByLabel('Data Field')
        .eq(2)
        .should('be.visible')
        .clear();

      ui.autocomplete
        .findByLabel('Data Field')
        .eq(2)
        .should('be.visible')
        .type('protocol');

      cy.findByText('protocol').should('be.visible').click();

      ui.autocomplete.findByLabel('Operator').eq(2).type('In');

      cy.findByText('In').should('be.visible').click();

      ui.autocomplete.findByLabel('Value').click();

      ui.autocomplete.findByLabel('Value').should('be.visible').type('TCP');
      cy.findByText('TCP').should('be.visible').click();

      // Fill metric details for the second rule

      const egressTrafficRateMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'Egress Traffic Rate',
        operator: '=',
        ruleIndex: 1,
        threshold: '1000',
      };

      fillMetricDetailsForSpecificRule(egressTrafficRateMetricDetails);
      // Set evaluation period
      ui.autocomplete
        .findByLabel('Evaluation Period')
        .should('be.visible')
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();

      // Set polling interval
      ui.autocomplete
        .findByLabel('Polling Interval')
        .should('be.visible')
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should('be.visible').click();

      // Set trigger occurrences
      cy.get('[data-qa-trigger-occurrences]').should('be.visible').clear();

      cy.get('[data-qa-trigger-occurrences]').should('be.visible').type('5');

      // Add notification channel
      ui.buttonGroup.find().contains('Add notification channel').click();

      ui.autocomplete.findByLabel('Type').should('be.visible').type('Email');
      ui.autocompletePopper.findByTitle('Email').should('be.visible').click();

      ui.autocomplete
        .findByLabel('Channel')
        .should('be.visible')
        .type('channel-1');

      ui.autocompletePopper
        .findByTitle('channel-1')
        .should('be.visible')
        .click();

      // Add channel
      ui.drawer
        .findByTitle('Add Notification Channel')
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Add channel')
            .should('be.visible')
            .click();
        });
      // Click on submit button
      ui.buttonGroup
        .find()
        .find('button')
        .filter('[type="submit"]')
        .should('be.visible')
        .should('be.enabled')
        .click();
      cy.wait('@createAlertDefinition').then(({ request, response }) => {
        const {
          description,
          label,
          rule_criteria: { rules },
          severity,
          trigger_conditions: {
            criteria_condition,
            evaluation_period_seconds,
            polling_interval_seconds,
            trigger_occurrences,
          },
        } = customAlertDefinition;

        const { created_by, status, updated } = mockAlerts;

        // Validate top-level properties
        expect(request.body.label).to.equal(label);
        expect(request.body.description).to.equal(description);
        expect(request.body.severity).to.equal(severity);
        expect(request.body.scope).to.equal(alerts.scope);

        // Validate rule criteria
        expect(request.body.rule_criteria).to.have.property('rules');
        // Validate first rule
        const firstRule = request.body.rule_criteria.rules[0];
        const firstCustomRule = rules[0];
        expect(firstRule.aggregate_function).to.equal(
          firstCustomRule.aggregate_function
        );
        expect(firstRule.metric).to.equal(firstCustomRule.metric);
        expect(firstRule.operator).to.equal(firstCustomRule.operator);
        expect(firstRule.threshold).to.equal(firstCustomRule.threshold);
        expect(firstRule.dimension_filters[0]?.dimension_label ?? '').to.equal(
          firstCustomRule.dimension_filters?.[0]?.dimension_label ?? ''
        );
        expect(firstRule.dimension_filters[0]?.operator ?? '').to.equal('eq');
        expect(firstRule.dimension_filters[0]?.value ?? '').to.equal('1');

        // Validate second rule
        const secondRule = request.body.rule_criteria.rules[1];
        const secondCustomRule = rules[1];
        expect(secondRule.aggregate_function).to.equal(
          secondCustomRule.aggregate_function
        );
        expect(secondRule.metric).to.equal(secondCustomRule.metric);
        expect(secondRule.operator).to.equal(secondCustomRule.operator);
        expect(secondRule.threshold).to.equal(secondCustomRule.threshold);

        // Validate trigger conditions
        const triggerConditions = request.body.trigger_conditions;
        expect(triggerConditions.trigger_occurrences).to.equal(
          trigger_occurrences
        );
        expect(triggerConditions.evaluation_period_seconds).to.equal(
          evaluation_period_seconds
        );
        expect(triggerConditions.polling_interval_seconds).to.equal(
          polling_interval_seconds
        );
        expect(triggerConditions.criteria_condition).to.equal(
          criteria_condition
        );
        // Validate entity IDs and channels
        expect(request.body.channel_ids).to.include(1);
        expect(response?.body.scope).to.eq(value);

        // Verify URL redirection and toast notification
        cy.url().should('endWith', '/alerts/definitions');
        ui.toast.assertMessage(CREATE_ALERT_SUCCESS_MESSAGE);
        // Confirm that Alert is listed on landing page with expected configuration.
        verifyAlertRow(label, status, statusMap, created_by, updated);
      });
    });
  });
});