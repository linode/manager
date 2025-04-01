/**
 * @fileoverview Cypress test suite for the "Create Alert" functionality.
 * This test validates the error messages for missing mandatory fields and various UI validations,
 * such as dimension filters, metrics, and notification channels.
 */

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
  regionFactory,
  triggerConditionFactory,
} from 'src/factories';

import type { Flags } from 'src/featureFlags';

// Step 1: Define mock data for the test.
const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
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
const notificationChannels = notificationChannelFactory.buildList(6);
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

// Step 2: Reusable functions for common actions.

// Function to add a notification channel
const addNotificationChannel = (type: string, channel: string) => {
  // Open the "Add notification channel" drawer.
  ui.buttonGroup.find().contains('Add notification channel').click();
  // Choose the type (e.g., Email) for the notification channel.
  ui.autocomplete.findByLabel('Type').should('be.visible').type(type);
  ui.autocompletePopper.findByTitle('Email').should('be.visible').click();
  // Choose the specific notification channel (e.g., Channel-1).
  ui.autocomplete.findByLabel('Channel').should('be.visible').type(channel);
  ui.autocompletePopper.findByTitle(channel).should('be.visible').click();

  // Confirm the notification channel has been added.
  ui.drawer
    .findByTitle('Add Notification Channel')
    .should('be.visible')
    .within(() => {
      ui.buttonGroup
        .findButtonByTitle('Add channel')
        .should('be.visible')
        .click();
    });
};

// Function to check error message for a specific field
const checkErrorMessage = (field: string, message: string) => {
  cy.get(`p[role="alert"][data-qa-textfield-error-text="${field}"]`)
    .should('exist')
    .should('have.text', message);
};

// Step 3: Test Case - Creating an Alert and validating error messages

describe('Create Alert - Error Messages Validation', () => {
  /**
   * - Verifies that error messages are displayed for missing mandatory fields like Name, Service, Severity, etc.
   * - Validates that dimension filters are limited to a maximum of 5, and an error tooltip appears when attempting to add more than 5 filters.
   * - Ensures that the "Add Metric" button is disabled after adding 5 metrics, and an error tooltip appears when attempting to add more than 5 metrics.
   * - Confirms that adding 5 notification channels disables the "Add Notification Channel" button, and the correct error tooltip is displayed.
   * - Verifies that removing a notification channel enables the "Add Notification Channel" button again.
   * - Ensures that missing field validation errors appear when attempting to submit an empty notification channel.
   */
  it('should display error messages for missing mandatory fields and various UI validations', () => {
    // Step 3.1: Setup mock data and intercept API calls.
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices([serviceType]);
    mockGetRegions([mockRegion]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetDatabases(databaseMock);
    mockGetAllAlertDefinitions([mockAlerts]).as('getAlertDefinitionsList');
    mockGetAlertChannels(notificationChannels);
    mockCreateAlertDefinition(serviceType, customAlertDefinition).as(
      'createAlertDefinition'
    );
    cy.visitWithLogin('/alerts/definitions/create');

    // Step 3.2: Submit the form without filling required fields and validate error messages.
    ui.buttonGroup
      .find()
      .find('button')
      .filter('[type="submit"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Check that error messages appear for required fields such as Name, Service, etc.
    checkErrorMessage('Name', 'This field is required.');
    checkErrorMessage('Service', 'This field is required.');
    checkErrorMessage('Severity', 'This field is required.');
    checkErrorMessage('Data Field', 'This field is required.');
    checkErrorMessage('Aggregation Type', 'This field is required.');
    checkErrorMessage('Operator', 'This field is required.');
    checkErrorMessage('Evaluation Period', 'This field is required.');
    checkErrorMessage('Polling Interval', 'This field is required.');

    // Step 3.3: Add and validate dimension filters.

    // Adding 5 dimension filters and verifying the 6th filter is disabled.
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.visible')
      .click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.visible')
      .click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.visible')
      .click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.visible')
      .click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.visible')
      .click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.disabled');
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('have.attr', 'aria-disabled', 'true');

    // Tooltip should indicate that the max limit for dimension filters has been reached.
    ui.tooltip
      .findByText('You can add up to 5 dimension filters.')
      .should('be.visible');

    // Step 3.4: Remove one dimension filter and ensure the button becomes enabled again.
    cy.get('[data-testid="clear-icon"]').first().click();
    ui.buttonGroup
      .findButtonByTitle('Add dimension filter')
      .should('be.enabled');
    ui.tooltip
      .findByText('You can add up to 5 dimension filters.')
      .should('not.exist');

    // Step 3.5: Add and validate metrics.

    // Adding metrics and verifying that the "Add metric" button is disabled after 5 metrics are added.
    cy.findByRole('button', { name: 'Add metric' }).click();
    cy.findByRole('button', { name: 'Add metric' }).click();
    cy.findByRole('button', { name: 'Add metric' }).click();
    cy.findByRole('button', { name: 'Add metric' }).click();
    cy.findByRole('button', { name: 'Add metric' }).should(
      'have.attr',
      'aria-disabled',
      'true'
    );

    // Tooltip should indicate that the max limit for metrics has been reached.
    ui.tooltip.findByText('You can add up to 5 metrics.').should('be.visible');

    // Step 3.6: Validate notification channels.

    // Adding 5 notification channels and verifying that the button becomes disabled.
    addNotificationChannel('Email', 'Channel-1');
    addNotificationChannel('Email', 'Channel-2');
    addNotificationChannel('Email', 'Channel-3');
    addNotificationChannel('Email', 'Channel-4');
    addNotificationChannel('Email', 'Channel-5');
    ui.buttonGroup
      .find()
      .contains('Add notification channel')
      .should('be.disabled');
    ui.tooltip
      .findByText('You can add up to 5 notification channels.')
      .should('be.visible');

    // Step 3.7: Remove a notification channel and check if the button is enabled again.
    cy.get('[data-testid="notification-channel-0"]')
      .find('[data-testid="clear-icon"]')
      .click();
    ui.buttonGroup
      .find()
      .contains('Add notification channel')
      .should('be.enabled');
    ui.tooltip
      .findByText('You can add up to 5 notification channels.')
      .should('not.exist');

    // Step 3.8: Test the form validation when no required fields are provided in the notification channel.
    ui.buttonGroup.find().contains('Add notification channel').click();
    ui.drawer
      .findByTitle('Add Notification Channel')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Add channel')
          .should('be.visible')
          .click();
      });

    // Check for missing field validation errors.
    checkErrorMessage('Type', 'This field is required.');
    checkErrorMessage('Channel', 'This field is required.');
  });
});
