/**
 * @file Integration tests for feature flag behavior on the Metrics page.
 */
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  dashboardFactory,
  dashboardMetricFactory,
  flagsFactory,
  widgetFactory,
} from 'src/factories';

import type { Flags } from 'src/featureFlags';

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

const { dashboardName, id, metrics } = widgetDetails.linode;
const serviceType = 'linode';
const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ name, title, unit, yLabel }) => {
    return widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
    });
  }),
});

const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
  })
);
const mockAccount = accountFactory.build();

describe('Linode ACLP Metrics and Alerts Flag Behavior', () => {
  /*
   * - Mocks ACLP feature flags dynamically to simulate various flag combinations for Linode services.
   *
   * - Validates visibility of "Linode" dashboard option in Metrics dropdown based on:
   *    - Presence of `aclpServices.linode.metrics` flag.
   *    - Enabled and beta states under `metrics` and `alerts` keys.
   *
   * - Ensures correct rendering behavior:
   *    - "Linode" option should appear only when `metrics.enabled` is true.
   *    - Beta chip should appear only when `metrics.beta` is also true.
   *    - Linode should not appear if `metrics` flag is missing, disabled, or malformed.
   *
   * - Asserts "no options" message is shown when Linode dashboard is not available.
   *
   * - Uses Cypress commands to:
   *    - Visit Metrics page after login.
   *    - Interact with autocomplete dropdown and select dashboards.
   *    - Validate presence/absence of beta chip (`[data-testid="betaChip"]`).
   *
   * - Improves test coverage for conditional UI behavior tied to feature flag configurations.
   * - Supports staged rollout testing and toggling of experimental dashboard features.
   */

  beforeEach(() => {
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetUserPreferences({});
  });
  it('should display "Linode" with a beta tag in the Service dropdown on the Metrics page when metrics.beta is enabled and the service is enabled', () => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    ui.autocomplete.findByLabel('Dashboard').as('dashboardInput');

    // Click using the alias
    cy.get('@dashboardInput').click();

    cy.get('[data-qa-id="linode"]') // Selects the Linode label
      .should('have.text', 'Linode')
      .parent() // Moves up to the <li> containing both label and chip
      .as('linodeBetaServiceOption'); // Alias for reuse

    cy.get('@linodeBetaServiceOption')
      .find('[data-testid="betaChip"]')
      .should('be.visible')
      .and('have.text', 'beta');

    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('have.text', dashboardName)
      .click();
  });

  it('should display "Linode" without a beta tag in the Service dropdown on the Metrics page when metrics.beta is false and the service is enabled', () => {
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          metrics: { beta: false, enabled: true },
        },
      },
    });

    // Apply mock flags
    mockAppendFeatureFlags(mockflags);
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');

    // Visit the Metrics page
    cy.visitWithLogin('/metrics');

    // Locate and open the Dashboard dropdown
    ui.autocomplete.findByLabel('Dashboard').as('dashboardInput');
    cy.get('@dashboardInput').click();

    // Verify "Linode" is present without a beta chip
    ui.autocompletePopper
      .findByTitle('Linode')
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid="betaChip"]').should('not.exist');
      });

    // Select the dashboard
    cy.get('@dashboardInput').should('be.visible').type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('have.text', dashboardName)
      .click();
  });

  it('should not display "Linode" with a beta tag in the Service dropdown on the Metrics page when metrics.beta is true and enabled is false', () => {
    // Mock the feature flags to disable metrics for Linode

    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          metrics: { beta: true, enabled: false },
        },
      },
    });
    // Apply the mock feature flags
    mockAppendFeatureFlags(mockflags);
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');

    // Visit the Metrics page after login

    cy.visitWithLogin('/metrics');

    // Verify the autocomplete is disabled and shows the placeholder text

    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled')
      .and('have.value', '');
  });
  // SKIPPED: The feature flag normalizer auto-enables Linode when `{ aclpServices: { linode: {} } }` is provided,
  // expanding to `aclpServices.linode.metrics = { beta: true, enabled: true }`. Expected: Linode hidden when the
  // flag is missing/empty. Unskip when either (a) the flag lib distinguishes missing/empty and treats them as
  // disabled, or (b) product adopts "omit key = disabled" and the test is updated accordingly.
  // Tracked in DI-27224 — unskip once flag handling is fixed.

  it.skip('should not display "Linode" when its feature flag is missing', () => {
    // Mock the feature flags without linode under aclpServices
    const flags = {
      aclp: { beta: true, enabled: true },
      aclpServices: { linode: {} },
    } as unknown as Partial<Flags>;
    mockAppendFeatureFlags(flags);
    // Visit the Metrics page after login
    cy.visitWithLogin('/metrics');
    // Open the dashboard autocomplete dropdown
    ui.autocomplete.findByLabel('Dashboard').as('dashboardInput');
    cy.get('@dashboardInput').click();

    // Verify the dropdown is visible and shows "no options"
    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled')
      .and('have.value', '');
  });

  it('should not display "Linode" with a beta tag in the Service dropdown on the Metrics page when metrics.beta is false and the service is not enabled', () => {
    // Mock the feature flags to disable metrics for Linode
    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          metrics: { beta: false, enabled: false },
        },
      },
    });
    // Apply the mock feature flags
    mockAppendFeatureFlags(mockflags);
    // Visit the Metrics page after login

    cy.visitWithLogin('/metrics');

    // Verify the autocomplete is disabled and shows the placeholder text

    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled')
      .and('have.value', '');
  });
  // SKIPPED: If `aclpServices` is not passed, LaunchDarkly should treat it as null/false.
  // Currently, missing/partial flags are defaulted to `{ beta: true, enabled: true }`,
  // which causes Linode to appear enabled instead of hidden.
  // Tracked in DI-27224 — unskip once flag handling is fixed.
  it.skip('should show no service options when aclpServices flag is missing', () => {
    // Mock the feature flags without linode under aclpServices
    const flags = {
      aclp: { beta: true, enabled: true },
    } as unknown as Partial<Flags>;
    mockAppendFeatureFlags(flags);
    // Visit the Metrics page after login
    cy.visitWithLogin('/metrics');
    // Open the dashboard autocomplete dropdown
    ui.autocomplete.findByLabel('Dashboard').as('dashboardInput');
    cy.get('@dashboardInput').click();

    // Verify the dropdown is disabled and shows the placeholder text
    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled')
      .and('have.value', '');
  });

  it('should not show Linode in Dashboard dropdown when metrics flags are missing and service is not enabled', () => {
    // Mock the feature flags to disable metrics for Linode

    const mockflags = flagsFactory.build({
      aclpServices: {
        linode: {
          metrics: { enabled: false },
        },
      },
    });
    // Apply the mock feature flags
    mockAppendFeatureFlags(mockflags);
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');

    // Visit the Metrics page after login

    cy.visitWithLogin('/metrics');

    // Verify the autocomplete is disabled and shows the placeholder text
    cy.findByPlaceholderText('Select a Dashboard')
      .should('be.visible')
      .and('be.disabled')
      .and('have.value', '');
  });
});
