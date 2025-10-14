/**
 * @file Integration Tests for CloudPulse Volume(blockstorage) Dashboard.
 */
import { regionFactory } from '@linode/utilities';
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
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolumes } from 'support/intercepts/volumes';
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
  flagsFactory,
  volumeFactory,
  widgetFactory,
} from 'src/factories';

const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics } = widgetDetails.blockstorage;
const serviceType = 'blockstorage';

// Build a shared dimension blockstorage
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
    capabilities: ['Block Storage'],
    id: 'us-ord',
    label: 'Chicago, IL',
    monitors: {
      metrics: ['Block Storage'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: ['Block Storage'],
    id: 'us-east',
    label: 'Newark, NJ',
    monitors: {
      metrics: ['Block Storage'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: ['Block Storage'],
    id: 'us-west',
    label: 'Fremont, CA',
    monitors: {
      metrics: ['Block Storage'],
      alerts: [],
    },
  }),
  regionFactory.build({
    capabilities: ['Block Storage'],
    id: 'eu-central',
    label: 'Frankfurt, DE',
    monitors: {
      metrics: ['Block Storage'],
      alerts: [],
    },
  }),
];

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockVolumesEncrypted = [
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord',
    region: 'us-ord', // Chicago
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord1',
    region: 'us-ord', // Chicago
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-west',
    region: 'us-west', // Fremont
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-eu',
    region: 'eu-central', // Frankfurt
  }),
];

describe('Integration Tests for Blockstorage Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(accountFactory.build());
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions(mockRegions);
    mockGetVolumes(mockVolumesEncrypted);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 7,
        widgets: {
          'Volume Read Operations': {
            label: 'Volume Read Operations',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
            groupBy: ['linode_id', 'entity_id', 'response_type'],
          },
        },
        region: 'us-ord',
        resources: ['1'],
        groupBy: ['entity_id', 'region'],
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
        cy.get('[data-qa-value="Region US, Chicago, IL"]')
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get('[data-qa-value="Volumes test-volume-ord"]')
          .should('be.visible')
          .should('have.text', 'test-volume-ord');
      });

    ui.button.findByTitle('Filters').click();
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

  it('clears the Region filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]').should('not.exist');
        cy.get('[data-qa-value="Volumes test-volume-ord"]').should('not.exist');
      });

    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 7,
        groupBy: ['entity_id', 'region'],
        widgets: {
          'Volume Read Operations': {
            label: 'Volume Read Operations',
            groupBy: ['linode_id', 'entity_id', 'response_type'],
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Volume Filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updatePreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Volumes"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]').should('be.visible');
        cy.get('[data-qa-value="Volumes test-volume-ord"]').should('not.exist');
      });

    cy.wait('@updatePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 7,
        groupBy: ['entity_id', 'region'],
        region: 'us-ord',
        resources: [],
        widgets: {
          'Volume Read Operations': {
            label: 'Volume Read Operations',
            groupBy: ['linode_id', 'entity_id', 'response_type'],
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
