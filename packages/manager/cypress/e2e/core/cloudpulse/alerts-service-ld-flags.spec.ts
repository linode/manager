/**
 * @file Integration tests for feature flag behavior on the alert page.
 */
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  dashboardMetricFactory,
  flagsFactory,
} from 'src/factories';
/**
 * This test ensures that widget titles are displayed correctly on the dashboard.
 * This test suite is dedicated to verifying the functionality and display of widgets on the Cloudpulse dashboard.
 *  It includes:
 * Validating that widgets are correctly loaded and displayed.
 * Ensuring that widget titles and data match the expected values.
 * Verifying that widget settings, such as granularity and aggregation, are applied correctly.
 * Testing widget interactions, including zooming and filtering, to ensure proper behavior.
 * Each test ensures that widgets on the dashboard operate correctly and display accurate information.
 */

const { metrics } = widgetDetails.linode;
const serviceType = 'linode';

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);

const mockAccount = accountFactory.build();
const CREATE_ALERT_PAGE_URL = '/alerts/definitions/create';
const NO_OPTIONS_TEXT = 'You have no options to choose from';

describe('Linode ACLP Metrics and Alerts Flag Behavior', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetUserPreferences({});
  });

  it('should show Linode with beta tag in Service dropdown on Alert page when alerts.beta is true', () => {
    mockAppendFeatureFlags(flagsFactory.build());
    cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
    ui.autocomplete.findByLabel('Service').as('serviceInput');
    cy.get('@serviceInput').click();

    cy.get('[data-qa-id="linode"]')
      .should('have.text', 'Linode')
      .parent()
      .as('linodeBetaServiceOption');

    cy.get('@linodeBetaServiceOption')
      .find('[data-testid="betaChip"]')
      .should('be.visible')
      .and('have.text', 'beta');

    cy.get('@serviceInput').should('be.visible').type('Linode');
    ui.autocompletePopper.findByTitle('Linode').should('be.visible').click();
  });
  it('should exclude Linode beta in Service dropdown when alerts.beta is false', () => {
    // Mock feature flags with alerts beta disabled
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          alerts: { beta: false, enabled: false },
        },
      },
    });

    mockAppendFeatureFlags(mockflags);

    // Visit the alert creation page
    cy.visitWithLogin(CREATE_ALERT_PAGE_URL);

    // Click the Service dropdown
    ui.autocomplete.findByLabel('Service').as('serviceInput');
    cy.get('@serviceInput').click();

    // Assert dropdown behavior
    cy.get('[data-qa-autocomplete-popper]')
      .should('be.visible')
      .and('have.text', NO_OPTIONS_TEXT)
      .and('not.contain.text', 'Linode beta');
  });

  it('should show no available services in the Service dropdown when Linode alerts are disabled but beta is true', () => {
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          alerts: { beta: true, enabled: false },
        },
      },
    });

    mockAppendFeatureFlags(mockflags);
    // Visit the alert creation page
    cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
    // Click the Service dropdown
    ui.autocomplete.findByLabel('Service').as('serviceInput');
    cy.get('@serviceInput').click();

    // ---------- Assert ----------
    cy.get('[data-qa-autocomplete-popper]')
      .should('be.visible')
      .and('have.text', NO_OPTIONS_TEXT)
      .and('not.contain.text', 'Linode beta');
  });

  it('should show no options and exclude Linode beta in Service dropdown when alerts are disabled but beta is true', () => {
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          alerts: { beta: true, enabled: false },
        },
      },
    });

    mockAppendFeatureFlags(mockflags);
    // Visit the alert creation page
    cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
    // Click the Service dropdown
    ui.autocomplete.findByLabel('Service').as('serviceInput');
    cy.get('@serviceInput').click();

    // ---------- Assert ----------
    cy.get('[data-qa-autocomplete-popper]')
      .should('be.visible')
      .and('contain.text', 'You have no options to choose from')
      .and('not.contain.text', 'Linode beta');
  });

  it('should show Linode without beta tag in Service dropdown when alerts are enabled but not in beta', () => {
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          alerts: { beta: false, enabled: true },
        },
      },
    });
    mockAppendFeatureFlags(mockflags);
    cy.visitWithLogin(CREATE_ALERT_PAGE_URL);
    ui.autocomplete.findByLabel('Service').as('serviceInput');
    cy.get('@serviceInput').click();

    // ---------- Assert ----------
    cy.get('[data-qa-id="linode"]')
      .should('have.text', 'Linode')
      .parent()
      .as('linodeBetaServiceOption');

    cy.get('@linodeBetaServiceOption')
      .find('[data-testid="betaChip"]')
      .should('not.exist');
  });
});
