/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 *
 * This test suite validates the process of creating an alert in the cloud monitoring system,
 * ensuring that users can navigate to the alert creation page, fill in required details,
 * and successfully submit the form. It also verifies the API interactions and UI behavior.
 *
 * Key Features:
 * - Mocks API responses for accounts, regions, Linodes, and alert definitions.
 * - Tests navigation from the Alert Listings page to the Create Alert page.
 * - Automates form filling, metric selection, and alert creation.
 * - Asserts successful alert creation with API validation and toast notifications.
 *
 */

import { Flags } from 'src/featureFlags';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { mockGetAccount } from 'support/intercepts/account';
import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  cpuRulesFactory,
  dashboardMetricFactory,
  databaseFactory,
  memoryRulesFactory,
  notificationChannelFactory,
  regionFactory,
  triggerConditionFactory,
} from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetDatabases } from 'support/intercepts/databases';
import { statusMap } from 'support/constants/alert';
import { formatDate } from 'src/utilities/formatDate';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

// Create mock data
const mockAccount = accountFactory.build();
const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});
const { metrics, serviceType } = widgetDetails.dbaas;
const databaseMock = databaseFactory.buildList(10, {
  region: 'us-ord',
  engine: 'mysql',
  cluster_size: 3,
});

const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  type: 'custom',
  label: 'channel-1',
  id: 1,
});

const customAlertDefinition = alertDefinitionFactory.build({
  channel_ids: [1],
  label: 'Alert-1',
  severity: 0,
  description: 'My Custom Description',
  entity_ids: ['2'],
  tags: [''],
  rule_criteria: {
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  trigger_conditions: triggerConditionFactory.build(),
});

const metricDefinitions = metrics.map(({ title, name, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);
const mockAlerts = alertFactory.build({
  service_type: 'dbaas',
  alert_channels: [{ id: 1 }],
  label: 'Alert-1',
  severity: 0,
  description: 'My Custom Description',
  entity_ids: ['2'],
  updated: new Date().toISOString(),
  created_by: 'user1',
  rule_criteria: {
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  trigger_conditions: triggerConditionFactory.build(),
  tags: [''],
});

/**
 * Fills metric details in the form.
 * @param ruleIndex - The index of the rule to fill.
 * @param dataField - The metric's data field (e.g., "CPU Utilization").
 * @param aggregationType - The aggregation type (e.g., "Average").
 * @param operator - The operator (e.g., ">=", "==").
 * @param threshold - The threshold value for the metric.
 */
const fillMetricDetailsForSpecificRule = (
  ruleIndex: number,
  dataField: string,
  aggregationType: string,
  operator: string,
  threshold: string
) => {
  cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
    // Fill Data Field
    cy.findByPlaceholderText('Select a Data Field')
      .should('be.visible')
      .clear()
      .type(dataField);

    cy.findByText(dataField).should('be.visible').click();

    // Fill Aggregation Type
    cy.findByPlaceholderText('Select an Aggregation Type')
      .should('be.visible')
      .clear()
      .type(aggregationType);
    cy.findByText(aggregationType).should('be.visible').click();

    // Fill Operator
    cy.findByPlaceholderText('Select an Operator')
      .should('be.visible')
      .clear()
      .type(operator);
    cy.findByText(operator).should('be.visible').click();

    // Fill Threshold
    cy.get('[data-qa-threshold]').should('be.visible').clear().type(threshold);
  });
};

describe('Create Alert', () => {
  /*
   * - Confirms that users can navigate from the Alert Listings page to the Create Alert page.
   * - Confirms that users can enter alert details, select resources, and configure conditions.
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
    mockCreateAlertDefinition(serviceType, customAlertDefinition).as(
      'createAlertDefinition'
    );
  });

  it('should navigate to the Create Alert page from the Alert Listings page', () => {
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/monitor/alerts/definitions');

    // Wait for the alert definitions list API call to complete
    cy.wait('@getAlertDefinitionsList');

    ui.buttonGroup
      .findButtonByTitle('Create Alert')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify the URL ends with the expected details page path
    cy.url().should('endWith', 'monitor/alerts/definitions/create');
  });

  it.only('should successfully create a new alert', () => {
    cy.visitWithLogin('monitor/alerts/definitions/create');

    // Enter Name and Description
    cy.findByPlaceholderText('Enter a Name')
      .should('be.visible')
      .type(customAlertDefinition.label);

    cy.findByPlaceholderText('Enter a Description')
      .should('be.visible')
      .type(customAlertDefinition.description ?? '');

    // Select Service
    ui.autocomplete.findByLabel('Service').should('be.visible').type('Databases');

    ui.autocompletePopper.findByTitle('Databases').should('be.visible').click();

    // Search for Resource
    cy.findByPlaceholderText('Search for a Region or Resource')
      .should('be.visible')
      .type('database-2');

    // Find the table and locate the resource cell containing 'database-2', then check the corresponding checkbox
    cy.get('[data-qa-alert-table="true"]') // Find the table
      .contains('[data-qa-alert-cell*="resource"]', 'database-2') // Find resource cell
      .parents('tr')
      .find('[type="checkbox"]')
      .check();

    // Assert resource selection notice
    cy.get('[data-qa-notice="true"]')
      .find('p')
      .should('have.text', '1 of 10 resources are selected.');

    cy.get('[data-qa-notice="true"]').should('be.visible').should('be.enabled');

    // Select Severity
    ui.autocomplete.findByLabel('Severity').should('be.visible').type('Severe');
    ui.autocompletePopper.findByTitle('Severe').should('be.visible').click();

    // Fill metric details for the first rule
    fillMetricDetailsForSpecificRule(
      0,
      'CPU Utilization',
      'Average',
      '=',
      '1000'
    );

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
      .clear()
      .type('State of CPU');

    cy.findByText('State of CPU').should('be.visible').click();

    ui.autocomplete
      .findByLabel('Operator')
      .eq(1)
      .should('be.visible')
      .clear()
      .type('Equal');

    cy.findByText('Equal').should('be.visible').click();

    ui.autocomplete.findByLabel('Value').should('be.visible').type('User');

    cy.findByText('User').should('be.visible').click();

    // Fill metric details for the second rule
    fillMetricDetailsForSpecificRule(
      1,
      'Memory Usage',
      'Average',
      '=',
      '1000'
    );

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
    cy.get('[data-qa-trigger_occurences]')
      .should('be.visible')
      .clear()
      .type('5');

    // Add notification channel
    cy.get('[data-qa-buttons="true"]')
      .should('be.visible')
      .should('be.enabled')
      .contains('Add notification channel')
      .click();

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

    // Ensure the cancel button is enabled and can be interacted with
    cy.get('[data-qa-buttons="true"]')
      .find('button')
      .filter('[type="submit"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createAlertDefinition').then(({ request, response }) => {
      // Assuming customAlertDefinition is defined and contains the necessary properties
      const {
        label,
        description,
        severity,
        rule_criteria: { rules },
        trigger_conditions: {
          trigger_occurrences,
          evaluation_period_seconds,
          polling_interval_seconds,
          criteria_condition,
        },
      } = customAlertDefinition;

      const { created_by, updated, status } = mockAlerts;

      expect(response).to.have.property('statusCode', 200);

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
      cy.url().should('endWith', 'monitor/alerts/definitions');
      ui.toast.assertMessage('Alert successfully created');

      // Confirm that Alert is listed on landing page with expected configuration.
      cy.findByText(label)
        .closest('tr')
        .within(() => {
          cy.findByText(label).should('be.visible');
          cy.findByText(statusMap[status]).should('be.visible'); // Assuming statusMap is defined somewhere
          cy.findByText('Databases').should('be.visible');
          cy.findByText(created_by).should('be.visible');
          cy.findByText(
            formatDate(updated, { format: 'MMM dd, yyyy, h:mm a' })
          );
        });
    });
  });
});
