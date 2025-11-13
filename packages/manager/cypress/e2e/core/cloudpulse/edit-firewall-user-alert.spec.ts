/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It verifies that alert details are correctly displayed, interactive, and editable.
 */

import { linodeFactory, profileFactory } from '@linode/utilities';
import {
  EVALUATION_PERIOD_DESCRIPTION,
  METRIC_DESCRIPTION_DATA_FIELD,
  POLLING_INTERVAL_DESCRIPTION,
  SEVERITY_LEVEL_DESCRIPTION,
} from 'support/constants/cloudpulse';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServiceByType,
  mockGetCloudPulseServices,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  firewallFactory,
  firewallMetricDefinitionsResponse,
  firewallMetricRulesFactory,
  flagsFactory,
  notificationChannelFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
} from 'src/factories';
import {
  ACCOUNT_GROUP_INFO_MESSAGE,
  entityGroupingOptions,
  UPDATE_ALERT_SUCCESS_MESSAGE,
} from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { Linode } from '@linode/api-v4';

const mockAccount = accountFactory.build();
const regionList = ['us-ord', 'us-east'];
const now = new Date();

const updated = `${now.toISOString().substring(0, 11)}10:41:00.000Z`;

// Mock alert details
const alertDetails = alertFactory.build({
  alert_channels: [{ id: 1 }],
  created_by: 'user1',
  description: 'My Custom Description',
  entity_ids: ['2'],
  label: 'Alert-2',

  rule_criteria: {
    rules: [
      firewallMetricRulesFactory.build({
        dimension_filters: [
          {
            label: 'Interface Type',
            dimension_label: 'interface_type',
            operator: 'eq',
            value: 'vpc',
          },
        ],
      }),
      firewallMetricRulesFactory.build({
        label: 'Ingress Packets Accepted (Linode)',
        metric: 'fw_ingress_packets_accepted',
        aggregate_function: 'sum',
        dimension_filters: [
          {
            label: 'Interface Type',
            dimension_label: 'interface_type',
            operator: 'eq',
            value: 'vpc',
          },
        ],
      }),
    ],
  },

  service_type: 'firewall',
  severity: 0,
  tags: [''],
  trigger_conditions: triggerConditionFactory.build(),
  type: 'user',
  updated,
  scope: 'entity',
  regions: regionList,
});

const { description, id, label, service_type } = alertDetails;

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
const services = serviceTypesFactory.build({
  service_type: 'firewall',
  label: 'firewall',
  alert: serviceAlertFactory.build(),
  regions: 'us-ord,us-east',
});
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
const mockLinodes: Linode[] = [
  linodeFactory.build({
    id: 1,
    label: 'Linode 1',
    region: 'us-ord',
  }),
];

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
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount);
    mockGetProfile(mockProfile);
    mockGetCloudPulseServiceByType('firewall', services);
    mockGetCloudPulseMetricDefinitions(
      service_type,
      firewallMetricDefinitionsResponse
    );
    mockGetFirewalls(mockFirewalls);
    mockGetLinodes(mockLinodes);
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
        cy.findByText('Firewall').should('be.visible');
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
    // Account-level alert validations
    Account: () => {
      cy.get('[data-qa-notice="true"]')
        .find('[data-testid="alert_message_notice"]')
        .should('have.text', ACCOUNT_GROUP_INFO_MESSAGE);
    },
    // Entity-level alert validations
    Entity: () => {
      const searchPlaceholder = 'Search for an Entity';
      // Validate headings
      ui.heading
        .findByText('entity')
        .scrollIntoView()
        .should('be.visible')
        .should('have.text', 'Entity');
      // Validate search inputs
      cy.findByPlaceholderText(searchPlaceholder).should('be.visible');

      // Assert row count
      cy.get('[data-qa-alert-row]').should('have.length', 2);

      // Entity search
      cy.findByPlaceholderText(searchPlaceholder).type(
        'firewall-linode_interface-2'
      );

      cy.get('[data-qa-alert-table="true"]')
        .find('[data-qa-alert-row]')
        .should('have.length', 1);
      // Region filter
      cy.get('[data-qa-debounced-search="true"]').within(() => {
        cy.get('[aria-label="Clear"]').click();
      });
    },
  };

  it('should correctly display the details of the alert in the Edit Alert page', () => {
    mockGetCloudPulseServices([alertDetails.service_type]);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    mockCreateAlertDefinition(service_type, alertDetails).as(
      'createAlertDefinition'
    );
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
      .should('have.value', 'Firewall');

    cy.findByLabelText('Severity').should('have.value', 'Severe');
    cy.findByLabelText('Scope').should('have.value', 'Entity');

    // Verify alert entity selection
    cy.get('[data-qa-alert-table="true"]')
      .contains('[data-qa-alert-cell*="entity"]', 'firewall-linode_interface-2')
      .parents('tr')
      .find('[type="checkbox"]')
      .should('be.checked');

    // Verify alert entity selection count message
    cy.get('[data-testid="selection_notice"]').should(
      'contain',
      '1 of 2 entities are selected.'
    );

    // Assert rule values 1
    assertRuleValues(0, {
      aggregationType: 'Avg',
      dataField: 'Current connections (Linode)',
      operator: '>',
      threshold: '1000',
    });
    assertRuleValues(1, {
      aggregationType: 'Sum',
      dataField: 'Ingress Packets Accepted (Linode)',
      operator: '>',
      threshold: '1000',
    });

    // Verify that tooltip messages are displayed correctly with accurate content.
    ui.tooltip.findByText(METRIC_DESCRIPTION_DATA_FIELD).should('be.visible');
    ui.tooltip.findByText(SEVERITY_LEVEL_DESCRIPTION).should('be.visible');
    ui.tooltip.findByText(EVALUATION_PERIOD_DESCRIPTION).should('be.visible');
    ui.tooltip.findByText(POLLING_INTERVAL_DESCRIPTION).should('be.visible');

    // Assert dimension filters
    const dimensionFilters = [
      { field: 'Interface Type', operator: 'Equal', value: 'VPC' },
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

  entityGroupingOptions
    .filter(({ value }) => service_type === 'firewall' && value !== 'region')
    .forEach(({ label: groupLabel, value }) => {
      it(`successfully updates alert details and verifies the API request matches the expected data for the "${groupLabel}" group.`, () => {
        const alertDetails = alertFactory.build({
          alert_channels: [{ id: 1 }],
          created_by: 'user1',
          description: 'My Custom Description',
          entity_ids: ['2'],
          label: 'Alert-2',
          rule_criteria: {
            rules: [
              firewallMetricRulesFactory.build({
                dimension_filters: [
                  {
                    label: 'Interface Type',
                    dimension_label: 'interface_type',
                    operator: 'eq',
                    value: 'vpc',
                  },
                ],
              }),
            ],
          },
          service_type: 'firewall',
          severity: 0,
          tags: [''],
          trigger_conditions: triggerConditionFactory.build(),
          type: 'user',
          updated,
          scope: value,
          id: 1,
          regions: regionList,
        });
        mockGetCloudPulseServiceByType('firewall', services);
        mockGetCloudPulseServices([alertDetails.service_type]);
        mockGetAllAlertDefinitions([alertDetails]).as(
          'getAlertDefinitionsList'
        );
        mockGetAlertDefinitions(service_type, id, alertDetails).as(
          'getAlertDefinitions'
        );
        mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
          'updateDefinitions'
        );
        mockCreateAlertDefinition(service_type, alertDetails).as(
          'createAlertDefinition'
        );
        cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);
        cy.wait('@getAlertDefinitions');
        cy.findByLabelText('Name').clear();
        cy.findByLabelText('Name').type('Alert-2');
        cy.findByLabelText('Description (optional)').clear();
        cy.findByLabelText('Description (optional)').type('update-description');
        cy.findByLabelText('Service').should('be.disabled');
        ui.autocomplete.findByLabel('Severity').clear();
        ui.autocomplete.findByLabel('Severity').type('Info');
        ui.autocompletePopper.findByTitle('Info').should('be.visible').click();
        // Execute the appropriate validation logic based on the alert's grouping label (e.g., 'Region' or 'Account' or 'Entity')
        scopeActions[groupLabel]();

        cy.get(
          '[data-qa-metric-threshold="rule_criteria.rules.0-data-field"]'
        ).within(() => {
          ui.button.findByAttribute('aria-label', 'Clear').click();
        });
        cy.get('[data-testid="rule_criteria.rules.0-id"]').within(() => {
          ui.autocomplete
            .findByLabel('Data Field')
            .type('Ingress Packets Accepted (Linode)');
          ui.autocompletePopper
            .findByTitle('Ingress Packets Accepted (Linode)')
            .click();
          ui.autocomplete.findByLabel('Aggregation Type').type('Sum');
          ui.autocompletePopper.findByTitle('Sum').click();
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
          value === 'region' &&
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
          expect(request.body.trigger_conditions.trigger_occurrences).to.equal(
            5
          );
          expect(request.body.rule_criteria.rules[0].threshold).to.equal(2000);
          expect(request.body.rule_criteria.rules[0].operator).to.equal('gt');
          expect(
            request.body.rule_criteria.rules[0].aggregate_function
          ).to.equal('sum');
          expect(request.body.rule_criteria.rules[0].metric).to.equal(
            'fw_ingress_packets_accepted'
          );

          // Verify URL redirection and toast notification
          cy.url().should('endWith', 'alerts/definitions');
          ui.toast.assertMessage(UPDATE_ALERT_SUCCESS_MESSAGE);

          // Confirm that Alert is listed on landing page with expected configuration.
          assertAlertRow('Alert-2', updated);
        });
      });
    });

  it('updates entity type from Linode to NodeBalancers and verifies Metric Threshold update', () => {
    const alertDetails = alertFactory.build({
      alert_channels: [{ id: 1 }],
      created_by: 'user1',
      description: 'My Custom Description',
      entity_ids: ['2'],
      label: 'Alert-2',
      rule_criteria: {
        rules: [
          firewallMetricRulesFactory.build({
            dimension_filters: [
              {
                label: 'Interface Type',
                dimension_label: 'interface_type',
                operator: 'eq',
                value: 'vpc',
              },
            ],
          }),
        ],
      },
      service_type: 'firewall',
      severity: 0,
      tags: [''],
      trigger_conditions: triggerConditionFactory.build(),
      type: 'user',
      updated,
      scope: 'entity',
      id: 1,
      regions: regionList,
    });

    // Mocks
    mockGetCloudPulseServiceByType('firewall', services);
    mockGetCloudPulseServices([alertDetails.service_type]);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    mockCreateAlertDefinition(service_type, alertDetails).as(
      'createAlertDefinition'
    );

    // Visit Edit Alert page
    cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);
    cy.wait('@getAlertDefinitions');

    // Update Entity Type → NodeBalancers
    ui.autocomplete.findByLabel('Entity Type').clear().type('NodeBalancers');
    ui.autocompletePopper.findByTitle('NodeBalancers').click();

    // Update the rule to NodeBalancer metric fields
    cy.get('[data-testid="rule_criteria.rules.0-id"]').within(() => {
      ui.autocomplete
        .findByLabel('Data Field')
        .type('Ingress Bytes Accepted (Node Balancer)');
      ui.autocompletePopper
        .findByTitle('Ingress Bytes Accepted (Node Balancer)')
        .click();

      ui.autocomplete.findByLabel('Aggregation Type').type('Sum');
      ui.autocompletePopper.findByTitle('Sum').click();

      ui.autocomplete.findByLabel('Operator').type('>');
      ui.autocompletePopper.findByTitle('>').click();

      cy.get('[data-qa-threshold]').clear();
      cy.get('[data-qa-threshold]').type('2000');
    });

    // Submit
    ui.buttonGroup
      .find()
      .find('button[type="submit"]')
      .should('be.enabled')
      .click();

    // Validate update API request
    cy.wait('@updateDefinitions').then(({ request }) => {
      expect(request.body.label).to.equal('Alert-2');
      expect(request.body.description).to.equal('My Custom Description');
      expect(request.body.severity).to.equal(0);

      // Trigger conditions unchanged (correct)
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

      // Rule updated correctly
      const rule = request.body.rule_criteria.rules[0];
      expect(rule.threshold).to.equal(2000);
      expect(rule.operator).to.equal('gt');
      expect(rule.aggregate_function).to.equal('sum');
      expect(rule.metric).to.equal('nb_ingress_bytes_accepted'); // ✔ Correct mapping

      // Redirect + toast
      cy.url().should('endWith', 'alerts/definitions');
      ui.toast.assertMessage(UPDATE_ALERT_SUCCESS_MESSAGE);

      // Landing page row validation
      assertAlertRow('Alert-2', updated);
    });
  });
});
