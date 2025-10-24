/**
 * @file Integration Tests for CloudPulse Firewall NodeBalancer Preferences.
 *
 * These tests validate user preference behavior for the CloudPulse DBaaS Dashboard,
 * ensuring that filters (Dashboard, Firewall Region, etc.) correctly update
 * the user's saved ACLP preferences through API requests and responses.
 */
import { nodeBalancerFactory, regionFactory } from '@linode/utilities';
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
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
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

import type { FirewallDeviceEntityType } from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

const timeDurationToSelect = 'Last 24 Hours';
const { metrics, dashboardName, firewalls, id } =
  widgetDetails.firewall_nodebalancer;
const serviceType = 'firewall';
const dimensions = [
  {
    label: 'Region',
    dimension_label: 'region',
    value: 'us-ord',
  },
];

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find((m) => m.name === metricName);
  if (!metric) return [];

  return metric.filters.map((filter) => ({
    dimension_label: filter.dimension_label,
    label: filter.dimension_label,
    values: filter.value ? [filter.value] : undefined,
  }));
};

// Dashboard creation
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['entity_id'],
  service_type: serviceType,
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      filters: [...dimensions],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      namespace_id: id,
      service_type: serviceType,
    })
  ),
});

// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);
const mockRegions = [
  regionFactory.build({
    capabilities: ['Linodes', 'Cloud Firewall'],
    id: 'us-east',
    label: 'Newark, NJ',
    monitors: {
      alerts: [],
      metrics: ['Cloud Firewall', 'Linodes'],
    },
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    monitors: {
      alerts: [],
      metrics: ['Linodes'],
    },
  }),
  regionFactory.build({
    capabilities: ['Linodes', 'Cloud Firewall'],
    id: 'br-gru',
    label: 'Sao Paulo, BR',
    country: 'br',
    monitors: {
      alerts: [],
      metrics: ['Linodes', 'Cloud Firewall'],
    },
  }),
];
const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: firewalls,
    status: 'enabled',
    entities: [
      {
        id: 1,
        label: 'nodebalancer-1',
        type: 'nodebalancer',
        url: '/test',
      },
    ],
  }),
];

const mockNodeBalancers = [
  nodeBalancerFactory.build({
    label: 'mockNodeBalancer-resource',
    region: 'us-east',
  }),
  nodeBalancerFactory.build({
    label: 'mockNodeBalancer-resource-ord',
    region: 'us-ord',
  }),
];
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

// Tests will be modified
describe('Integration Tests for firewall nodebalancer Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build({}));
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(8, dashboard);
    mockGetNodeBalancers(mockNodeBalancers);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetFirewalls(mockFirewalls);
    mockGetRegions(mockRegions);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 8,
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: ['IP Version'],
          },
        },
        associated_entity_region: 'us-east', // added this field
        groupBy: ['entity_id', 'region', 'Protocol'],
        resource_id: '1', // optional if needed
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
        cy.get('[data-qa-value="Firewall Firewall-0"]')
          .should('be.visible')
          .should('have.text', 'Firewall-0');

        // Check NodeBalancer Region
        cy.get('[data-qa-value="NodeBalancer Region US, Newark, NJ"]')
          .should('be.visible')
          .should('have.text', 'US, Newark, NJ');
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
        '[data-qa-autocomplete="NodeBalancer Region"] input[data-testid="textfield-input"]'
      ).should('have.value', 'US, Newark, NJ (us-east)');

      // Firewalls autocomplete
      cy.get('[data-qa-autocomplete="Firewall"] input[data-testid="textfield-input"]')
      .should('be.visible')       // input is visible
      .should('have.value', 'Firewall-0') // input has correct value
      .click();                   // open the dropdown

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
    cy.get('[data-qa-autocomplete="Firewall"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        // Check Firewalls
        cy.get('[data-qa-value="Firewall Firewall-0"]').should('not.exist');

        // Check NodeBalancer Region
        cy.get('[data-qa-value="NodeBalancer Region US, Newark, NJ"]').should(
          'not.exist'
        );
      });
    cy.wait('@updateRegionPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 8,
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: ['IP Version'],
          },
        },
        groupBy: ['entity_id', 'region', 'Protocol'],
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Region Resource filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="NodeBalancer Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        // Check Firewalls
        cy.get('[data-qa-value="Firewall Firewall-0"]')
          .should('be.visible')
          .should('have.text', 'Firewall-0');

        // Check NodeBalancer Region
        cy.get('[data-qa-value="NodeBalancer Region US, Newark, NJ"]').should(
          'not.exist'
        );
      });

    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 8,
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: ['IP Version'],
          },
        },
        resource_id: '1',
        groupBy: ['entity_id', 'region', 'Protocol'],
      };
      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });

  it('Deselect All the Group By filter at dashboard level and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    // Scope to the "Global Group By" drawer
    cy.get('[aria-labelledby="globalGroupBy"]').within(() => {
      // Open the Autocomplete dropdown for Dimensions
      cy.get('[data-qa-autocomplete="Dimensions"]')
        .find('[title="Open"]') // the Open button
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle('Deselect All')
        .should('be.visible')
        .click();
    });

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();
    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 8,
        associated_entity_region: 'us-east',
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: ['IP Version'],
          },
        },
        resource_id: '1',
        groupBy: [],
      };
      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });
  it('clears the "Entity Id" Group By filter at the dashboard level and verifies that user preferences are updated accordingly', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    // Scope to the "Global Group By" drawer

    cy.get('[aria-labelledby="globalGroupBy"]').within(() => {
      // Open the Autocomplete dropdown for Dimensions
      cy.get('[data-qa-autocomplete="Dimensions"]')
        .find('[title="Open"]') // the Open button
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle('Entity Id')
        .should('be.visible')
        .click();
    });

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();
    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 8,
        associated_entity_region: 'us-east',
        groupBy: ['region', 'Protocol'],
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: ['IP Version'],
          },
        },
        resource_id: '1',
      };
      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });

  it('Deselect all Group By filter at the widget level and verifies that user preferences are updated accordingly', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    const widgetSelector = '[data-qa-widget="Accepted Bytes"]';

    cy.get(widgetSelector)
      .should('be.visible')
      .within(() => {
        // Create alias for the group by button
        ui.button
          .findByAttribute('aria-label', 'Group By Dashboard Metrics')
          .as('groupByButton'); // alias

        cy.get('@groupByButton').scrollIntoView();

        // Click the button
        cy.get('@groupByButton').should('be.visible').click();
      });

    // Scope to the "Global Group By" drawer

    cy.get('[aria-labelledby="groupBy"]').within(() => {
      // Open the Autocomplete dropdown for Dimensions
      cy.get('[data-qa-autocomplete="Dimensions"]')
        .find('[title="Open"]') // the Open button
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle('Deselect All')
        .should('be.visible')
        .click();
    });

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();
    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 8,
        associated_entity_region: 'us-east',
        groupBy: ['entity_id', 'region', 'Protocol'],
        widgets: {
          'Accepted Bytes': {
            label: 'Accepted Bytes',
            groupBy: [],
          },
        },
        resource_id: '1',
      };
      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
    });
  });

  it('Deselect all "Group By" filters at both Dashboard and Widget levels and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );

    ui.button
      .findByAttribute('aria-label', 'Group By Dashboard Metrics')
      .should('be.visible')
      .first()
      .as('dashboardGroupByBtn');

    cy.get('@dashboardGroupByBtn').should('be.visible').click();

    // Scope to the "Global Group By" drawer
    cy.get('[aria-labelledby="globalGroupBy"]').within(() => {
      // Open the Autocomplete dropdown for Dimensions
      cy.get('[data-qa-autocomplete="Dimensions"]')
        .find('[title="Open"]') // the Open button
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle('Deselect All')
        .should('be.visible')
        .click();
    });

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();

    const widgetSelector = '[data-qa-widget="Accepted Bytes"]';

    cy.get(widgetSelector)
      .should('be.visible')
      .within(() => {
        // Create alias for the group by button
        ui.button
          .findByAttribute('aria-label', 'Group By Dashboard Metrics')
          .as('groupByButton'); // alias

        cy.get('@groupByButton').scrollIntoView();

        // Click the button
        cy.get('@groupByButton').should('be.visible').click();
      });

    // Scope to the "Global Group By" drawer

    cy.get('[aria-labelledby="groupBy"]').within(() => {
      // Open the Autocomplete dropdown for Dimensions
      cy.get('[data-qa-autocomplete="Dimensions"]')
        .find('[title="Open"]') // the Open button
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocompletePopper
        .findByTitle('Deselect All')
        .should('be.visible')
        .click();
    });

    // Close the drawer using ESC
    cy.get('body').type('{esc}');

    // Click Apply to confirm the Group By selection
    cy.findByTestId('apply').should('be.visible').and('be.enabled').click();

    cy.get('@updatePreference.all')
      .should('have.length.gte', 2) // make sure at least 2 calls happened
      .then((allIntercepts: unknown) => {
        const interceptions = allIntercepts as Interception[];

        // Defensive check for second call
        const secondCall = interceptions[1];
        if (!secondCall) {
          throw new Error('Second Group By PUT request not found');
        }

        const request = secondCall.request;
        const response = secondCall.response;

        const responseBody = response?.body
          ? typeof response.body === 'string'
            ? JSON.parse(response.body)
            : response.body
          : {};

        const expectedAclpPreference = {
          dashboardId: 8,
          widgets: {
            'Accepted Bytes': {
              label: 'Accepted Bytes',
              groupBy: [],
            },
          },
          associated_entity_region: 'us-east',
          resource_id: '1',
          groupBy: [],
        };

        // Compare safely
        if (responseBody.aclpPreference) {
          comparePreferences(
            expectedAclpPreference,
            responseBody.aclpPreference
          );
        } else {
          cy.log('Warning: responseBody.aclpPreference is undefined');
        }

        if (request?.body?.aclpPreference) {
          comparePreferences(
            expectedAclpPreference,
            request.body.aclpPreference
          );
        } else {
          cy.log('Warning: request.body.aclpPreference is undefined');
        }
      });
  });
});
