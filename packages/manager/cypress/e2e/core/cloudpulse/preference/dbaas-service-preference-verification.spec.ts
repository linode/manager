/**
 * @file Integration Tests for CloudPulse DBaaS Preferences.
 *
 * These tests validate user preference behavior for the CloudPulse DBaaS Dashboard,
 * ensuring that filters (Dashboard, Database Engine, Region, etc.) correctly update
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
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
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
  databaseFactory,
  flagsFactory,
  kubeLinodeFactory,
  widgetFactory,
} from 'src/factories';

import type { CloudPulseServiceType, Database } from '@linode/api-v4';

const timeDurationToSelect = 'Last 24 Hours';
const { clusterName, dashboardName, engine, id, metrics, serviceType } =
  widgetDetails.dbaas;

// Build a shared dimension object
const dimensions = [
  {
    label: 'Node Type',
    dimension_label: 'node_type',
    value: 'secondary',
  },
  {
    label: 'Region',
    dimension_label: 'region',
    value: 'us-ord',
  },
  {
    label: 'Engine',
    dimension_label: 'engine',
    value: 'mysql',
  },
];

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find((m) => m.name === metricName);
  if (!metric) return [];

  return metric.filters.map((f) => ({
    dimension_label: f.dimension_label,
    label: f.dimension_label,
    values: f.value ? [f.value] : undefined,
  }));
};

// Dashboard creation
const dashboard = dashboardFactory.build({
  label: dashboardName,
  group_by: ['entity_id'],
  service_type: serviceType as CloudPulseServiceType,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      entity_ids: [String(id)],
      filters: [...dimensions],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      namespace_id: id,
      service_type: serviceType as CloudPulseServiceType,
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

const mockLinode = linodeFactory.build({
  id: kubeLinodeFactory.build().instance_id ?? undefined,
  label: clusterName,
  region: 'us-ord',
});

const mockAccount = accountFactory.build();

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    metrics: ['Managed Databases'],
    alerts: [],
  },
});

const extendedMockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-east',
  label: 'Newark,NL',
});
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const databaseMock: Database = databaseFactory.build({
  engine: 'mysql',
  label: clusterName,
  region: mockRegion.id,
  type: engine,
});

/**
 * This test suite validates CloudPulse DBaaS user preference updates in the Dashboard UI.
 *
 * Each test simulates clearing a specific filter (Dashboard, Database Engine, Region, Database Cluster, or Node Type)
 * and verifies that:
 *  - The filter is visually removed from the applied filters section.
 *  - The correct `PUT /profile/preferences` API call is triggered.
 *  - The request and response objects match the expected `aclpPreference` structure.
 *
 * The suite uses:
 *  - Mocked API intercepts for dashboards, regions, databases, metrics, and user preferences.
 *  - A reusable `comparePreferences` utility for deep object validation between actual and expected preferences.
 *  - Dynamic setup of widgets and dimensions to simulate realistic CloudPulse DBaaS data.
 *
 * Test Flow:
 *  1. The page is initialized with a full set of filters applied via mock user preferences.
 *  2. Each test clears one filter and asserts that:
 *     - The UI correctly reflects the cleared state.
 *     - The updated preference payload excludes only the cleared key(s).
 *     - Remaining preferences (e.g., time range, widgets, or groupBy) persist as expected.
 *
 * Purpose:
 *  Ensures that CloudPulse DBaaS filter interactions properly persist and sync user preferences
 *  between the UI and API, maintaining state consistency across sessions.
 */

describe('Integration Tests for DBaaS Dashboard Preferences', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount);
    mockGetLinodes([mockLinode]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion, extendedMockRegion]);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 1,
        engine: 'mysql',
        region: 'us-ord',
        resources: ['1'],
        node_type: 'primary',
        dateTimeDuration: {
          preset: 'Last day',
          timeZone: 'Etc/GMT',
        },
        groupBy: ['entity_id', 'region'],
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            groupBy: ['device'],
          },
        },
      },
    }).as('fetchPreferences');

    mockGetDatabases([databaseMock]).as('getDatabases');

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices','@fetchDashboard','@fetchPreferences']);

    ui.button.findByTitle('Filters').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Database Engine MySQL"]').and(
        'have.text',
        'MySQL'
      );

      cy.get('[data-qa-value="Region US, Chicago, IL"]')
        .should('be.visible')
        .and('have.text', 'US, Chicago, IL');

      cy.get('[data-qa-value="Node Type Primary"]')
        .should('be.visible')
        .and('have.text', 'Primary');

      cy.get('[data-qa-value="Database Clusters mysql-cluster"]')
        .should('be.visible')
        .and('have.text', 'mysql-cluster');
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

  it('clears the Database Engine filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBEnginePreference'
    );
    // clear the Database Engine filter
    cy.get('[data-qa-autocomplete="Database Engine"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Database Engine MySQL"]').should('not.exist');
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('not.exist');
      cy.get('[data-qa-value="Node Type Primary"]').should('not.exist');
      cy.get('[data-qa-value="Database Clusters mysql-cluster"]').should(
        'not.exist'
      );
    });
    cy.wait('@updateDBEnginePreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 1,
        node_type: 'primary',
        groupBy: ['entity_id', 'region'],
        resources: [],
        dateTimeDuration: {
          preset: 'Last day',
          timeZone: 'Etc/GMT',
        },
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            groupBy: ['device'],
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Region filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateRegionPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Database Engine MySQL"]').should('be.visible');
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('not.exist');
      cy.get('[data-qa-value="Node Type Primary"]').should('not.exist');
      cy.get('[data-qa-value="Database Clusters mysql-cluster"]').should(
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
        dashboardId: 1,
        node_type: 'primary',
        engine: 'mysql',
        resources: [],
        groupBy: ['entity_id', 'region'],
        dateTimeDuration: {
          preset: 'Last day',
          timeZone: 'Etc/GMT',
        },
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            groupBy: ['device'],
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });
  it('clears the Database Clusters filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Database Clusters"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Database Engine MySQL"]').should('be.visible');
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('be.visible');
      cy.get('[data-qa-value="Node Type Primary"]').should('not.exist');
      cy.get('[data-qa-value="Database Clusters mysql-cluster"]').should(
        'not.exist'
      );
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 1,
        engine: 'mysql',
        region: 'us-ord',
        resources: [],
        dateTimeDuration: {
          preset: 'Last day',
          timeZone: 'Etc/GMT',
        },
        groupBy: ['entity_id', 'region'],
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            groupBy: ['device'],
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Node Type filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Node Type"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Database Engine MySQL"]').should('be.visible');
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('be.visible');
      cy.get('[data-qa-value="Node Type Primary"]').should('not.exist');
      cy.get('[data-qa-value="Database Clusters mysql-cluster"]').should(
        'be.visible'
      );
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 1,
        engine: 'mysql',
        region: 'us-ord',
        resources: ['1'],
        dateTimeDuration: {
          preset: 'Last day',
          timeZone: 'Etc/GMT',
        },
        groupBy: ['entity_id', 'region'],
        widgets: {
          'Disk I/O': {
            label: 'Disk I/O',
            groupBy: ['device'],
          },
        },
      };

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });
});
