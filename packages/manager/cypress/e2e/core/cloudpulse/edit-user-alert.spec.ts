/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It verifies that alert details are correctly displayed, interactive, and editable.
 */

import {
  EVALUATION_PERIOD_DESCRIPTION,
  METRIC_DESCRIPTION_DATA_FIELD,
  POLLING_INTERVAL_DESCRIPTION,
  SEVERITY_LEVEL_DESCRIPTION,
} from 'support/constants/cloudpulse';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
  mockUpdateAlertDefinitions,
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
  regionFactory,
  triggerConditionFactory,
} from 'src/factories';
import { OPTIMISTIC_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

// Feature flag setup
const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();

// Mock alert definition
const customAlertDefinition = alertDefinitionFactory.build({
  channel_ids: [1],
  description: 'update-description',
  entity_ids: ['1', '2', '3', '4', '5'],
  label: 'Alert-1',
  rule_criteria: {
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
});

// Mock alert details
const alertDetails = alertFactory.build({
  alert_channels: [{ id: 1 }],
  created_by: 'user1',
  description: 'My Custom Description',
  entity_ids: ['2'],
  label: 'Alert-2',
  rule_criteria: {
    rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
  },
  service_type: 'dbaas',
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
  type: 'user',
  updated: new Date().toISOString(),
});

const { description, id, label, service_type, updated } = alertDetails;

// Mock regions
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-east',
    label: 'Newark',
  }),
];

// Mock databases
const databases: Database[] = databaseFactory.buildList(5).map((db, index) => ({
  ...db,
  engine: 'mysql',
  id: index,
  region: regions[index % regions.length].id,
  status: 'active',
  type: 'MySQL',
}));

// Mock metric definitions
const { metrics } = widgetDetails.dbaas;
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({ label: title, metric: name, unit })
);

// Mock notification channels
const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  id: 1,
  label: 'Channel-1',
  type: 'custom',
});

describe('Integration Tests for Edit Alert', () => {
  /*
   * - Confirms that the Edit Alert page loads with the correct alert details.
   * - Verifies that the alert form contains the appropriate pre-filled data from the mock alert.
   * - Confirms that rule criteria values are correctly displayed.
   * - Verifies that the correct notification channel details are displayed.
   * - Ensures the tooltip descriptions for the alert configuration are visible and contain the correct content.
   * - Confirms that the correct regions, databases, and metrics are available for selection in the form.
   * - Verifies that the user can successfully edit and submit changes to the alert.
   * - Confirms that the UI handles updates to alert data correctly and submits them via the API.
   * - Confirms that the API request matches the expected data structure and values upon saving the updated alert.
   * - Verifies that the user is redirected back to the Alert Definitions List page after saving changes.
   * - Ensures a success toast notification appears after the alert is updated.
   * - Confirms that the alert is listed correctly with the updated configuration on the Alert Definitions List page.
   */
  beforeEach(() => {
    // Mocking various API responses
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions(regions);
    mockGetCloudPulseServices([alertDetails.service_type]);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockGetDatabases(databases).as('getDatabases');
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    mockCreateAlertDefinition(service_type, customAlertDefinition).as(
      'createAlertDefinition'
    );
    mockGetCloudPulseMetricDefinitions(service_type, metricDefinitions);
    mockGetAlertChannels([notificationChannels]);
  });

  // Define an interface for rule values
  interface RuleCriteria {
    aggregationType: string;
    dataField: string;
    operator: string;
    threshold: string;
  }

  // Mapping of interface keys to data attributes
  const fieldSelectors: Record<keyof RuleCriteria, string> = {
    aggregationType: 'aggregation-type',
    dataField: 'data-field',
    operator: 'operator',
    threshold: 'threshold',
  };

  // Function to assert rule values
  const assertRuleValues = (ruleIndex: number, rule: RuleCriteria) => {
    cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
      (Object.keys(rule) as (keyof RuleCriteria)[]).forEach((key) => {
        cy.get(
          `[data-qa-metric-threshold="rule_criteria.rules.${ruleIndex}-${fieldSelectors[key]}"]`
        )
          .should('be.visible')
          .find('input')
          .should('have.value', rule[key]);
      });
    });
  };

  it('should correctly display the details of the alert in the Edit Alert page', () => {
    cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);
    cy.wait('@getAlertDefinitions');

    // Verify form fields
    cy.findByLabelText('Name').should('have.value', label);
    cy.findByLabelText('Description (optional)').should(
      'have.value',
      description
    );
    cy.findByLabelText('Service')
      .should('be.disabled')
      .should('have.value', 'Databases');
    cy.findByLabelText('Severity').should('have.value', 'Severe');

    // Verify alert resource selection
    cy.get('[data-qa-alert-table="true"]')
      .contains('[data-qa-alert-cell*="resource"]', 'database-3')
      .parents('tr')
      .find('[type="checkbox"]')
      .should('be.checked');

    // Verify alert resource selection count message
    cy.get('[data-qa-notice="true"]')
      .find('p')
      .should('contain.text', '1 of 5 resources are selected.');

    // Assert rule values 1
    assertRuleValues(0, {
      aggregationType: 'Average',
      dataField: 'CPU Utilization',
      operator: '=',
      threshold: '1000',
    });

    // Assert rule values 2
    assertRuleValues(1, {
      aggregationType: 'Average',
      dataField: 'Memory Usage',
      operator: '=',
      threshold: '1000',
    });

    // Verify that tooltip messages are displayed correctly with accurate content.
    ui.tooltip.findByText(METRIC_DESCRIPTION_DATA_FIELD).should('be.visible');
    ui.tooltip.findByText(SEVERITY_LEVEL_DESCRIPTION).should('be.visible');
    ui.tooltip.findByText(EVALUATION_PERIOD_DESCRIPTION).should('be.visible');
    ui.tooltip.findByText(POLLING_INTERVAL_DESCRIPTION).should('be.visible');

    // Assert dimension filters
    const dimensionFilters = [
      { field: 'State of CPU', operator: 'Equal', value: 'User' },
    ];

    dimensionFilters.forEach((filter, index) => {
      cy.get(
        `[data-qa-dimension-filter="rule_criteria.rules.0.dimension_filters.${index}-data-field"]`
      )
        .should('be.visible')
        .find('input')
        .should('have.value', filter.field);

      cy.get(
        `[data-qa-dimension-filter="rule_criteria.rules.0.dimension_filters.${index}-operator"]`
      )
        .should('be.visible')
        .find('input')
        .should('have.value', filter.operator);

      cy.get(
        `[data-qa-dimension-filter="rule_criteria.rules.0.dimension_filters.${index}-value"]`
      )
        .should('be.visible')
        .find('input')
        .should('have.value', filter.value);
    });

    // Verify notification details
    cy.get('[data-qa-notification="notification-channel-0"]').within(() => {
      cy.get('[data-qa-channel]').should('have.text', 'Channel-1');
      cy.get('[data-qa-type]').next().should('have.text', 'Email');
      cy.get('[data-qa-channel-details]').should(
        'have.text',
        'test@test.comtest2@test.com'
      );
    });
  });

  it('successfully updated alert details and verified that the API request matches the expected test data.', () => {
    cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);
    cy.wait('@getAlertDefinitions');

    // Make changes to alert form
    cy.findByLabelText('Name').clear();
    cy.findByLabelText('Name').type('Alert-2');
    cy.findByLabelText('Description (optional)').clear();
    cy.findByLabelText('Description (optional)').type('update-description');
    cy.findByLabelText('Service').should('be.disabled');
    ui.autocomplete.findByLabel('Severity').clear();
    ui.autocomplete.findByLabel('Severity').type('Info');
    ui.autocompletePopper.findByTitle('Info').should('be.visible').click();
    cy.get('[data-qa-notice="true"]')
      .find('button')
      .contains('Deselect All')
      .click();

    cy.get('[data-qa-notice="true"]').contains('Select All').click();

    cy.get(
      '[data-qa-metric-threshold="rule_criteria.rules.0-data-field"]'
    ).within(() => {
      ui.button.findByAttribute('aria-label', 'Clear').click();
    });
    cy.get('[data-testid="rule_criteria.rules.0-id"]').within(() => {
      ui.autocomplete.findByLabel('Data Field').type('Disk I/O');
      ui.autocompletePopper.findByTitle('Disk I/O').click();
      ui.autocomplete.findByLabel('Aggregation Type').type('Minimum');
      ui.autocompletePopper.findByTitle('Minimum').click();
      ui.autocomplete.findByLabel('Operator').type('>');
      ui.autocompletePopper.findByTitle('>').click();
      cy.get('[data-qa-threshold]').should('be.visible').clear();
      cy.get('[data-qa-threshold]').should('be.visible').type('2000');
    });

    // click on the submit button
    ui.buttonGroup
      .find()
      .find('button')
      .filter('[type="submit"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@updateDefinitions').then(({ request }) => {
      // Assert the API request data
      expect(request.body.label).to.equal('Alert-2');
      expect(request.body.description).to.equal('update-description');
      expect(request.body.severity).to.equal(3);
      expect(request.body.entity_ids).to.have.members([
        '0',
        '1',
        '2',
        '3',
        '4',
      ]);
      expect(request.body.channel_ids[0]).to.equal(1);
      expect(request.body).to.have.property('trigger_conditions');
      expect(request.body.trigger_conditions.criteria_condition).to.equal(
        'ALL'
      );
      expect(
        request.body.trigger_conditions.evaluation_period_seconds
      ).to.equal(300);
      expect(request.body.trigger_conditions.polling_interval_seconds).to.equal(
        300
      );
      expect(request.body.trigger_conditions.trigger_occurrences).to.equal(5);
      expect(request.body.rule_criteria.rules[0].threshold).to.equal(2000);
      expect(request.body.rule_criteria.rules[0].operator).to.equal('gt');
      expect(request.body.rule_criteria.rules[0].aggregate_function).to.equal(
        'min'
      );
      expect(request.body.rule_criteria.rules[0].metric).to.equal(
        'system_disk_OPS_total'
      );
      expect(request.body.rule_criteria.rules[1].aggregate_function).to.equal(
        'avg'
      );
      expect(request.body.rule_criteria.rules[1].metric).to.equal(
        'system_memory_usage_by_resource'
      );
      expect(request.body.rule_criteria.rules[1].operator).to.equal('eq');
      expect(request.body.rule_criteria.rules[1].threshold).to.equal(1000);

      // Verify URL redirection and toast notification
      cy.url().should('endWith', 'alerts/definitions');
      ui.toast.assertMessage(OPTIMISTIC_SUCCESS_MESSAGE);

      // Confirm that Alert is listed on landing page with expected configuration.
      cy.findByText('Alert-2')
        .closest('tr')
        .within(() => {
          cy.findByText('Alert-2').should('be.visible');
          cy.findByText('Enabled').should('be.visible');
          cy.findByText('Databases').should('be.visible');
          cy.findByText('user1').should('be.visible');
          cy.findByText(
            formatDate(updated, { format: 'MMM dd, yyyy, h:mm a' })
          ).should('be.visible');
        });
    });
  });
});
