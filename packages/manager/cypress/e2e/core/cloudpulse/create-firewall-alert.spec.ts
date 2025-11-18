/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 */
import { linodeFactory, profileFactory } from '@linode/utilities';
import { statusMap } from 'support/constants/alert';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServiceByType,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  availableConnectionsRulesFactory,
  currentConnectionsRulesFactory,
  dashboardMetricFactory,
  egressBytesAcceptedRulesFactory,
  egressPacketsAcceptedRulesFactory,
  egressPacketsDroppedRulesFactory,
  firewallFactory,
  flagsFactory,
  ingressBytesAcceptedRulesFactory,
  ingressPacketsAcceptedRulesFactory,
  ingressPacketsDroppedRulesFactory,
  newEgressConnectionsRulesFactory,
  newIngressConnectionsRulesFactory,
  notificationChannelFactory,
  packetsDroppedConnectionTableFullRulesFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
} from 'src/factories';
import { CREATE_ALERT_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { entityGroupingOptions } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Linode } from '@linode/api-v4';

export interface MetricDetails {
  aggregationType: string;
  dataField: string;
  operator: string;
  ruleIndex: number;
  threshold: string;
}
// Create mock data
const mockAccount = accountFactory.build();
const { firewalls, serviceType } = widgetDetails.firewall;
const regionList = ['us-ord', 'us-east'];
const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  id: 1,
  label: 'channel-1',
  type: 'custom',
});

const customAlertDefinition = alertDefinitionFactory.build({
  channel_ids: [1],
  description: 'My Custom Description',
  entity_ids: ['2'],
  label: 'Alert-1',
  rule_criteria: {
    rules: [
      currentConnectionsRulesFactory.build(),
      availableConnectionsRulesFactory.build(),
      ingressPacketsAcceptedRulesFactory.build(),
      egressPacketsAcceptedRulesFactory.build(),
      ingressBytesAcceptedRulesFactory.build(),
      egressBytesAcceptedRulesFactory.build(),
      ingressPacketsDroppedRulesFactory.build(),
      egressPacketsDroppedRulesFactory.build(),
      packetsDroppedConnectionTableFullRulesFactory.build(),
      newIngressConnectionsRulesFactory.build(),
      newEgressConnectionsRulesFactory.build(),
    ],
  },
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
});

const firewallMetricDefinitionData = [
  {
    title: 'Current connections (Linode)',
    name: 'current_connections',
    unit: 'count',
  },
  {
    title: 'Available connections (Linode)',
    name: 'available_connections',
    unit: 'count',
  },
  {
    title: 'Ingress packets accepted (Linode)',
    name: 'fw_ingress_packets_accepted',
    unit: 'packets_per_second',
  },

  {
    title: 'Current connections (Node Balancer)',
    name: 'current_connections',
    unit: 'count',
  },
  {
    title: 'Available connections (Node Balancer)',
    name: 'available_connections',
    unit: 'count',
  },
  {
    title: 'Ingress packets accepted (Node Balancer)',
    name: 'fw_ingress_packets_accepted',
    unit: 'packets_per_second',
  },
];

const metricDefinitions = firewallMetricDefinitionData.map(
  ({ name, title, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
      dimensions: [
        {
          dimension_label: 'Linode',
          label: 'parent_vm_entity_id"',
          values: [],
        },
        {
          dimension_label: 'Linode Region',
          label: 'region_id',
          values: [],
        },
        {
          dimension_label: 'customer_id',
          label: 'Customer ID',
          values: [],
        },
        {
          dimension_label: 'parent_vm_entity_id',
          label: 'Parent VM Entity ID',
          values: [],
        },
        {
          dimension_label: 'entity_id',
          label: 'Entity ID',
          values: [],
        },
        {
          dimension_label: 'interface_id',
          label: 'Interface ID',
          values: [],
        },
        {
          dimension_label: 'interface_type',
          label: 'Interface Type',
          values: ['VPC', 'PUBLIC'],
        },
        {
          dimension_label: 'VPC-Subnet',
          label: 'vpc_subnet_id',
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
  service_type: 'firewall',
  entity_ids: ['2'],
});
const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: firewalls,
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
        cy.findByText('Firewall').should('be.visible');
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

const mockLinodes: Linode[] = [
  linodeFactory.build({
    id: 1,
    label: 'Linode 1',
    region: 'us-ord',
  }),
];

describe('Firewall alert configured successfully', () => {
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
  // The scoping strategies include 'Per Account', 'Per Entity'.
  // Temporary: Only testing entity-level for firewall alerts.
  // Once account-level is supported, remove `value === 'entity'` condition.

  const entities = [
    { title: 'Linodes', value: 'Linode' },
    { title: 'NodeBalancers', value: 'Node Balancer' },
  ];

  entityGroupingOptions
    .filter(({ value }) => serviceType === 'firewall' && value !== 'region')
    .forEach(({ label: groupLabel, value }) => {
      entities.forEach((entityType) => {
        it(`should successfully create a new alert for ${groupLabel} scope and entity type ${entityType.title}`, () => {
          const alerts = alertFactory.build({
            alert_channels: [{ id: 1 }],
            created_by: 'user1',
            description: 'My Custom Description',
            label: 'Alert-1',
            entity_ids: ['2'],
            rule_criteria: {
              rules: [
                currentConnectionsRulesFactory.build(),
                availableConnectionsRulesFactory.build(),
              ],
            },
            service_type: 'firewall',
            severity: 0,
            tags: [''],
            trigger_conditions: triggerConditionFactory.build(),
            scope: value,
            ...(value === 'region' ? { regions: regionList } : {}),
          });
          const services = serviceTypesFactory.build({
            service_type: 'firewall',
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
          mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
          mockGetAllAlertDefinitions([mockAlerts]).as(
            'getAlertDefinitionsList'
          );
          mockGetAlertChannels([notificationChannels]);
          mockGetFirewalls(mockFirewalls);
          mockGetLinodes(mockLinodes);
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
          ui.autocomplete.findByLabel('Service').type('Firewall');
          ui.autocompletePopper.findByTitle('Firewall').click();
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

          ui.autocomplete
            .findByLabel('Entity Type')
            .should('be.visible')
            .clear()
            .type(entityType.title);

          ui.autocompletePopper
            .findByTitle(entityType.title)
            .should('be.visible')
            .click();
          ui.tooltip.findByText(
            'Select a firewall entity type to filter the list in the Entities section. The metrics and dimensions in the Criteria section will update automatically based on your selection.'
          );

          groupLabel !== 'Account' &&
            cy.get('[data-testid="select_all_notice"]').click();
          // Fill metric details for the first rule
          const connectionsMetricDetails = {
            aggregationType: 'Avg',
            dataField: `Current connections (${entityType.value})`,
            operator: '=',
            ruleIndex: 0,
            threshold: '1000',
          };

          fillMetricDetailsForSpecificRule(connectionsMetricDetails);

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
            .type('region_id');

          cy.findByText('region_id').should('be.visible').click();

          ui.autocomplete
            .findByLabel('Operator')
            .eq(1)
            .should('be.visible')
            .clear();

          ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');

          cy.findByText('Equal').should('be.visible').click();

          cy.findByPlaceholderText('Enter a Value')
            .should('be.visible')
            .type('Chicago, IL');

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
            .type('Interface Type');

          cy.findByText('Interface Type').should('be.visible').click();
          ui.autocomplete.findByLabel('Operator').eq(2).type('In');

          cy.findByText('In').should('be.visible').click();

          ui.autocomplete.findByLabel('Value').click();

          ui.autocomplete
            .findByLabel('Value')
            .should('be.visible')
            .should('not.be.disabled')
            .click()
            .type('VPC');

          ui.autocompletePopper.findByTitle('VPC').click();

          // Fill metric details for the second rule

          const egressTrafficRateMetricDetails = {
            aggregationType: 'Avg',
            dataField: `Available connections (${entityType.value})`,
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
          ui.autocompletePopper
            .findByTitle('5 min')
            .should('be.visible')
            .click();

          // Set polling interval
          ui.autocomplete
            .findByLabel('Polling Interval')
            .should('be.visible')
            .type('5 min');
          ui.autocompletePopper
            .findByTitle('5 min')
            .should('be.visible')
            .click();

          // Set trigger occurrences
          cy.get('[data-qa-trigger-occurrences]').should('be.visible').clear();

          cy.get('[data-qa-trigger-occurrences]')
            .should('be.visible')
            .type('5');

          // Add notification channel
          ui.buttonGroup.find().contains('Add notification channel').click();

          ui.autocomplete
            .findByLabel('Type')
            .should('be.visible')
            .type('Email');
          ui.autocompletePopper
            .findByTitle('Email')
            .should('be.visible')
            .click();

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

            // Destructure server fields away and build cleanedResponse
            // ✅ Strip out all server-managed or irrelevant fields
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
            expect(firstRule.dimension_filters[0].dimension_label).to.equal(
              'Linode Region'
            );
            expect(firstRule.dimension_filters[0]?.operator ?? '').to.equal(
              'eq'
            );
            expect(firstRule.dimension_filters[0]?.value ?? '').to.equal(
              'Chicago, IL'
            );

            // Validate second rule
            const secondRule = request.body.rule_criteria.rules[0];
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
});
