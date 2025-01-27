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
import { randomString } from 'support/util/random';
import { mockGetAccount } from 'support/intercepts/account';
import {
  accountFactory,
  alertDefinitionFactory,
  alertFactory,
  dashboardMetricFactory,
  linodeFactory,
  notificationChannelFactory,
  regionFactory,
} from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { widgetDetails } from 'support/constants/widgets';

// Define feature flags
const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

// Create mock data
const mockAccount = accountFactory.build();
const mockRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-ord',
  label: 'Chicago, IL',
});
const { metrics } = widgetDetails.linode;
const mockResource = linodeFactory.buildList(5);
const notificationChannels = [
  notificationChannelFactory.build({
    channel_type: 'email',
    type: 'custom',
    label: 'channel-1',
  }),
];
const customAlertDefinition = alertDefinitionFactory.build({
  channel_ids: [1],
  label: 'Custom Alert Label',
  severity: 1,
});

const metricDefinitions = metrics.map(({ title, name, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);
const mockAlerts = [
  alertFactory.build({
    service_type: 'linode',
  }),
  alertFactory.build({
    service_type: 'linode',
  }),
];
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
  beforeEach(() => {
    // Mock API responses
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(['linode', 'dbaas']);
    mockGetRegions([mockRegion]);
    mockGetLinodes(mockResource);
    mockGetCloudPulseMetricDefinitions('linode', metricDefinitions);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    mockGetAlertChannels(notificationChannels);
    mockCreateAlertDefinition('linode', customAlertDefinition).as(
      'getAlertDefinition'
    );

    // Visit the create alert page
    cy.visitWithLogin('monitor/alerts/definitions/create');
  });

  it('should create an alert', () => {
    // Enter Name and Description
    cy.findByPlaceholderText('Enter Name')
      .should('be.visible')
      .type(`My Alert - ${randomString(5)}`);
    cy.findByPlaceholderText('Enter Description')
      .should('be.visible')
      .type('My Description');

    // Select Service
    ui.autocomplete.findByLabel('Service').should('be.visible').type('linode');
    ui.autocompletePopper.findByTitle('linode').should('be.visible').click();

    // Select Region
    ui.regionSelect.find().click();
    ui.regionSelect.find().type('Chicago, IL{enter}');

    // Select Resources
    ui.autocomplete
      .findByLabel('Resources')
      .should('be.visible')
      .type('Select All {enter}');
    cy.get('body').click();

    // Select Severity
    ui.autocomplete.findByLabel('Severity').should('be.visible').type('Severe');
    ui.autocompletePopper.findByTitle('Severe').should('be.visible').click();

    // Add metrics
    cy.findByRole('button', { name: 'Add metric' })
      .should('be.visible')
      .click();

    fillMetricDetailsForSpecificRule(
      0,
      'CPU Utilization',
      'Average',
      '>=',
      '1000'
    );
    fillMetricDetailsForSpecificRule(1, 'Memory Usage', 'Minimum', '==', '100');

    // Set evaluation period
    ui.autocomplete
      .findByLabel('Evaluation Period')
      .should('be.visible')
      .type('1 min');
    ui.autocompletePopper.findByTitle('1 min').should('be.visible').click();

    // Set polling interval
    ui.autocomplete
      .findByLabel('Polling Interval')
      .should('be.visible')
      .type('1 min');
    ui.autocompletePopper.findByTitle('1 min').should('be.visible').click();

    // Set trigger occurrences
    cy.get('[data-qa-trigger_occurences]')
      .should('be.visible')
      .clear()
      .type('5');

    ui.buttonGroup
      .findButtonByTitle('Add notification channel')
      .should('be.visible')
      .click();

    ui.autocomplete.findByLabel('Type').should('be.visible').type('Email');

    ui.autocompletePopper.findByTitle('Email').should('be.visible').click();

    ui.autocomplete
      .findByLabel('Channel')
      .should('be.visible')
      .type('channel-1');

    ui.autocompletePopper.findByTitle('channel-1').should('be.visible').click();

    ui.drawer
      .findByTitle('Add Notification Channel')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Add channel')
          .should('be.visible')
          .click();
      });
    cy.get('[data-testid="button"]')
      .should('be.visible')
      .filter('[label="Submit"]')
      .click();
  });
});
