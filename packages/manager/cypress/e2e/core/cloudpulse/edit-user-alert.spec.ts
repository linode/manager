/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It verifies that alert details are correctly displayed, interactive, and editable.
 */

import { profileFactory, regionFactory } from '@linode/utilities';
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
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  cpuRulesFactory,
  dashboardMetricFactory,
  databaseFactory,
  memoryRulesFactory,
  notificationChannelFactory,
  triggerConditionFactory,
} from 'src/factories';
import {
  ACCOUNT_GROUP_INFO_MESSAGE,
  entityGroupingOptions,
  REGION_GROUP_INFO_MESSAGE,
  UPDATE_ALERT_SUCCESS_MESSAGE,
} from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

// Feature flag setup
const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const regionList = ['us-ord', 'us-east'];

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
  group: 'per-entity',
  regions: regionList,
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
const mockProfile = profileFactory.build({
  timezone: 'gmt',
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
    mockGetProfile(mockProfile);
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
    mockCreateAlertDefinition(service_type, alertDetails).as(
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
  /**
   * Assert that a table row corresponding to a specific alert label
   * contains all expected values including status, service type, user, and timestamp.
   *
   * @param {string} label - The alert label to find in the table row.
   * @param {string | Date} updated - The last updated timestamp (ISO string or Date object).
   */
  const assertAlertRow = (label: string, updated: string): void => {
    const formattedDate = formatDate(updated, {
      format: 'MMM dd, yyyy, h:mm a',
      timezone: 'GMT',
    });

    cy.findByText(label)
      .closest('tr')
      .within(() => {
        cy.findByText(label).should('be.visible');
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('Databases').should('be.visible');
        cy.findByText('user1').should('be.visible');
        cy.findByText(formattedDate).should('be.visible');
      });
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
    cy.findByLabelText('Scope').should('have.value', 'Entity');

    // Verify alert entity selection
    cy.get('[data-qa-alert-table="true"]')
      .contains('[data-qa-alert-cell*="entity"]', 'database-3')
      .parents('tr')
      .find('[type="checkbox"]')
      .should('be.checked');

    // Verify alert entity selection count message
    cy.get('[data-testid="selection_notice"]').should(
      'contain',
      '1 of 5 entities are selected.'
    );

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

  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`successfully updates alert details and verifies the API request matches the expected data for the "${groupLabel}" group.`, () => {
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
        group: value,
        regions: regionList,
      });
      mockGetRegions(regions);
      mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
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
      ui.autocomplete
        .findByLabel('Scope')
        .should('be.visible')
        .clear()
        .type(groupLabel);

      // Execute the appropriate validation logic based on the alert's grouping label (e.g., 'Region' or 'Account' or 'Entity')
      scopeActions[groupLabel];

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
        value === 'per-region' &&
          expect(
            request.body.regions,
            'Regions should match when grouping is per-region'
          ).to.have.members(regionList);
        expect(request.body.channel_ids[0]).to.equal(1);
        expect(request.body).to.have.property('trigger_conditions');
        expect(request.body.trigger_conditions.criteria_condition).to.equal(
          'ALL'
        );
        expect(
          request.body.trigger_conditions.evaluation_period_seconds
        ).to.equal(300);
        expect(
          request.body.trigger_conditions.polling_interval_seconds
        ).to.equal(300);
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
        ui.toast.assertMessage(UPDATE_ALERT_SUCCESS_MESSAGE);

        // Confirm that Alert is listed on landing page with expected configuration.
        assertAlertRow('Alert-2', updated);
      });
    });
  });
});
