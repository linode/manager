/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 */

import { regionFactory } from '@linode/utilities';
import { statusMap } from 'support/constants/alert';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  cpuRulesFactory,
  dashboardMetricFactory,
  databaseFactory,
  memoryRulesFactory,
  notificationChannelFactory,
  triggerConditionFactory,
} from 'src/factories';
import { CREATE_ALERT_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Flags } from 'src/featureFlags';

export interface MetricDetails {
  aggregationType: string;
  dataField: string;
  operator: string;
  ruleIndex: number;
  threshold: string;
}

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };

// Create mock data
const mockAccount = accountFactory.build();
const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});
const { metrics, serviceType } = widgetDetails.dbaas;
const databaseMock = databaseFactory.buildList(10, {
  cluster_size: 3,
  engine: 'mysql',
  region: 'us-ord',
});

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
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
});

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);
const mockAlerts = alertFactory.build({
  alert_channels: [{ id: 1 }],
  created_by: 'user1',
  description: 'My Custom Description',
  entity_ids: ['2'],
  label: 'Alert-1',
  rule_criteria: {
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  service_type: 'dbaas',
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
  updated: new Date().toISOString(),
});

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

describe('Create Alert', () => {
  /*
   * - Confirms that users can navigate from the Alert Listings page to the Create Alert page.
   * - Confirms that users can enter alert details, select entities, and configure conditions.
   * - Confirms that the UI allows adding notification channels and setting thresholds.
   * - Confirms client-side validation when entering invalid metric values.
   * - Confirms that API interactions work correctly and return the expected responses.
   * - Confirms that the UI displays a success message after creating an alert.
   */
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices([serviceType]);
    mockGetRegions([mockRegion]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetDatabases(databaseMock);
    mockGetAllAlertDefinitions([mockAlerts]).as('getAlertDefinitionsList');
    mockGetAlertChannels([notificationChannels]);
    mockCreateAlertDefinition(serviceType, mockAlerts).as(
      'createAlertDefinition'
    );
  });

  it('should navigate to the Create Alert page from the Alert Listings page', () => {
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/alerts/definitions');

    // Wait for the alert definitions list API call to complete
    cy.wait('@getAlertDefinitionsList');

    ui.buttonGroup
      .findButtonByTitle('Create Alert')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify the URL ends with the expected details page path
    cy.url().should('endWith', '/alerts/definitions/create');
  });

  it('should successfully create a new alert', () => {
    cy.visitWithLogin('/alerts/definitions/create');

    // Enter Name and Description
    cy.findByPlaceholderText('Enter a Name')
      .should('be.visible')
      .type(customAlertDefinition.label);

    cy.findByPlaceholderText('Enter a Description')
      .should('be.visible')
      .type(customAlertDefinition.description ?? '');

    // Select Service
    ui.autocomplete
      .findByLabel('Service')
      .should('be.visible')
      .type('Databases');
    ui.autocompletePopper.findByTitle('Databases').should('be.visible').click();
    // Select Severity
    ui.autocomplete.findByLabel('Severity').should('be.visible').type('Severe');
    ui.autocompletePopper.findByTitle('Severe').should('be.visible').click();

    // Search for Entity
    cy.findByPlaceholderText('Search for a Region or Entity')
      .should('be.visible')
      .type('database-2');

    // Find the table and locate the entity cell containing 'database-2', then check the corresponding checkbox
    cy.get('[data-qa-alert-table="true"]') // Find the table
      .contains('[data-qa-alert-cell*="entity"]', 'database-2') // Find entity cell
      .parents('tr')
      .find('[type="checkbox"]')
      .check();

    // Assert entity selection notice
    cy.findByText('1 of 10 entities are selected.');

    // Fill metric details for the first rule
    const cpuUsageMetricDetails = {
      aggregationType: 'Average',
      dataField: 'CPU Utilization',
      operator: '=',
      ruleIndex: 0,
      threshold: '1000',
    };

    fillMetricDetailsForSpecificRule(cpuUsageMetricDetails);

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
      .type('State of CPU');

    cy.findByText('State of CPU').should('be.visible').click();

    ui.autocomplete.findByLabel('Operator').eq(1).should('be.visible').clear();

    ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');

    cy.findByText('Equal').should('be.visible').click();

    ui.autocomplete.findByLabel('Value').should('be.visible').type('User');

    cy.findByText('User').should('be.visible').click();

    // Fill metric details for the second rule

    const memoryUsageMetricDetails = {
      aggregationType: 'Average',
      dataField: 'Memory Usage',
      operator: '=',
      ruleIndex: 1,
      threshold: '1000',
    };

    fillMetricDetailsForSpecificRule(memoryUsageMetricDetails);
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

    ui.autocompletePopper.findByTitle('channel-1').should('be.visible').click();

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

    cy.wait('@createAlertDefinition').then(({ request }) => {
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

      // Validate rule criteria
      expect(request.body.rule_criteria).to.have.property('rules');
      expect(request.body.rule_criteria.rules)
        .to.be.an('array')
        .with.length(rules.length);

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
      expect(firstRule.dimension_filters[0]?.operator ?? '').to.equal(
        firstCustomRule.dimension_filters?.[0]?.operator ?? ''
      );
      expect(firstRule.dimension_filters[0]?.value ?? '').to.equal(
        firstCustomRule.dimension_filters?.[0]?.value ?? ''
      );

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
      expect(triggerConditions.criteria_condition).to.equal(criteria_condition);

      // Validate entity IDs and channels
      expect(request.body.entity_ids).to.include('2');
      expect(request.body.channel_ids).to.include(1);

      // Verify URL redirection and toast notification
      cy.url().should('endWith', '/alerts/definitions');
      ui.toast.assertMessage(CREATE_ALERT_SUCCESS_MESSAGE);

      // Confirm that Alert is listed on landing page with expected configuration.
      cy.findByText(label)
        .closest('tr')
        .within(() => {
          cy.findByText(label).should('be.visible');
          cy.findByText(statusMap[status]).should('be.visible');
          cy.findByText('Databases').should('be.visible');
          cy.findByText(created_by).should('be.visible');
          cy.findByText(
            formatDate(updated, { format: 'MMM dd, yyyy, h:mm a' })
          );
        });
    });
  });
});
