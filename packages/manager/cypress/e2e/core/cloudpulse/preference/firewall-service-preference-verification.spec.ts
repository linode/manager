/**
 * @file Integration Tests for CloudPulse Firewall Preferences.
 *
 * These tests validate user preference behavior for the CloudPulse DBaaS Dashboard,
 * ensuring that filters (Dashboard, Region, etc.) correctly update
 * the user's saved ACLP preferences through API requests and responses.
 */
import { linodeFactory, regionFactory } from '@linode/utilities';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateCloudPulseJWEToken,
  mockCreateCloudPulseMetrics,
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import {
  comparePreferences,
  generateRandomMetricsData,
} from 'support/util/cloudpulse';
import { apiMatcher } from 'support/util/intercepts';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  firewallFactory,
  flagsFactory,
  widgetFactory,
} from 'src/factories';

const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, firewalls } = widgetDetails.firewall;
const serviceType = 'firewall';
const dashboard = dashboardFactory.build({
  label: dashboardName,
  id,
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

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockLinode = linodeFactory.build({
  id: 1,
  label: firewalls,
  region: 'us-east',
});
const mockRegion = regionFactory.build({
  capabilities: ['Linodes', 'Cloud Firewall'],
  id: 'us-east',
  label: 'Newark, NJ',
  monitors: {
    alerts: [],
    metrics: ['Cloud Firewall', 'Linodes'],
  },
});

const mockFirewalls = firewallFactory.build({ label: firewalls });

// Tests will be modified
describe('Integration Tests for firewall Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build({}));
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetLinodes([mockLinode]);
    mockGetFirewalls([mockFirewalls]);
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 4,
        widgets: {
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
        region: 'us-east',
        resources: ['1'],
        groupBy: ['entity_id', 'state'],
        associated_entity_region: 'us-east',
        interface_type: ['vpc'],
        interface_id: '12',
      },
    }).as('fetchPreferences');

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchPreferences']);

    ui.button.findByTitle('Filters').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        // Check Firewalls
        cy.get(`[data-qa-value="Firewalls ${firewalls}"]`)
          .should('be.visible')
          .should('have.text', firewalls);

        // Check Interface Types
        cy.get('[data-qa-value="Interface Types VPC"]')
          .should('be.visible')
          .should('have.text', 'VPC');

        // Check Interface IDs
        cy.get('[data-qa-value="Interface IDs 12"]')
          .should('be.visible')
          .should('have.text', '12');
      });

    ui.button.findByTitle('Filters').click();
    cy.scrollTo('top');
  });

  it('reloads the page and verifies preferences are restored from API', () => {
    cy.intercept('GET', apiMatcher('profile/preferences')).as(
      'fetchPreferencesReload'
    );
    cy.reload();
    cy.wait('@fetchPreferencesReload');
    cy.get('[data-qa-paper="true"]').within(() => {
      // Dashboard autocomplete
      cy.get(
        '[data-qa-autocomplete="Dashboard"] input[data-testid="textfield-input"]'
      ).should('have.value', dashboardName);

      // Region autocomplete
      cy.get(
        '[data-qa-autocomplete="Linode Region"] input[data-testid="textfield-input"]'
      ).should('have.value', 'US, Newark, NJ (us-east)');

      // Firewalls autocomplete
      ui.autocomplete
        .findByLabel('Firewalls')
        .parent() // wrapper containing chips
        .find('[role="button"][data-tag-index="0"]') // select the inner span only
        .should('have.text', firewalls);

      ui.autocomplete
        .findByLabel('Interface Types')
        .parent() // wrapper containing chips
        .find('[role="button"][data-tag-index="0"]') // select the inner span only
        .should('have.text', 'VPC');

      cy.findByPlaceholderText('e.g., 1234,5678').should('have.value', '12');

      // Refresh button (tooltip)
      cy.get('[data-qa-tooltip="Refresh"]').should('exist');

      // Group By button
      cy.get('[data-testid="group-by"]').should(
        'have.attr',
        'data-qa-selected',
        'true'
      );
    });

    cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
    cy.get('@startDateInput').click();
    cy.get('button[data-qa-preset="Last day"]')
      .should('be.visible')
      .and('have.text', 'Last day');

    ui.buttonGroup
      .findButtonByTitle('Cancel')
      .should('be.visible')
      .and('be.enabled')
      .click();
  });

  it('clears the Dashboard filters and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDashbaordPreference'
    );
    // clear Dashboard filter
    cy.get('[data-qa-autocomplete="Dashboard"]')
      .find('button[aria-label="Clear"]')
      .click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').should('not.exist');
    cy.wait('@updateDashbaordPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = { widgets: {} };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Firewall filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateRegionPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Firewalls"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="US, Newark, NJ, USA"]').should('not.exist');
      cy.get(`[data-qa-value="Firewalls ${firewalls}"]`).should('not.exist');
      cy.get('[data-qa-value="Interface Types VPC"]').should('be.visible');
      cy.get('[data-qa-value="Interface IDs 12"]').should('be.visible');
    });
    cy.wait('@updateRegionPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 4,
        groupBy: ['entity_id', 'state'],
        widgets: {
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
        region: 'us-east',
        resources: [],
        interface_type: ['vpc'],
        interface_id: '12',
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Region Resource filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Linode Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="US, Newark, NJ, USA"]').should('not.exist');
      cy.get(`[data-qa-value="Firewalls ${firewalls}"]`).should('be.visible');
      cy.get('[data-qa-value="Interface Types VPC"]').should('be.visible');
      cy.get('[data-qa-value="Interface IDs 12"]').should('be.visible');
    });

    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 4,
        groupBy: ['entity_id', 'state'],
        interface_type: ['vpc'],
        interface_id: '12',
        region: 'us-east',
        resources: ['1'],
        widgets: {
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
      };

      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });

  it('clears the Interface Types Filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Interface Types"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Linode Region US, Newark, NJ"]').should(
        'be.visible'
      );
      cy.get(`[data-qa-value="Firewalls ${firewalls}"]`).should('be.visible');
      cy.get('[data-qa-value="Interface Types VPC"]').should('not.exist');
      cy.get('[data-qa-value="Interface IDs 12"]').should('be.visible');
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 4,
        groupBy: ['entity_id', 'state'],
        interface_type: [],
        interface_id: '12',
        associated_entity_region: 'us-east',
        region: 'us-east',
        resources: ['1'],
        widgets: {
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
      };

      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });
  it('clears the Interface Id Filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.findByPlaceholderText('e.g., 1234,5678').clear();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Linode Region US, Newark, NJ"]').should(
        'be.visible'
      );
      cy.get(`[data-qa-value="Firewalls ${firewalls}"]`).should('be.visible');
      cy.get('[data-qa-value="Interface Types VPC"]').should('be.visible');
      cy.get('[data-qa-value="Interface IDs 12"]').should('not.exist');
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 4,
        groupBy: ['entity_id', 'state'],
        interface_type: ['vpc'],
        interface_id: '',
        associated_entity_region: 'us-east',
        region: 'us-east',
        resources: ['1'],
        widgets: {
          'CPU Utilization': {
            label: 'CPU Utilization',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
      };

      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });
});
