/**
 * @file Integration Tests for CloudPulse Lke Preferences.
 *
 * These tests validate user preference behavior for the CloudPulse Lke Dashboard,
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
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetClusters } from 'support/intercepts/lke';
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
  flagsFactory,
  kubeLinodeFactory,
  kubernetesClusterFactory,
  widgetFactory,
} from 'src/factories';

const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, resource } = widgetDetails.lke;
const serviceType = 'lke';
const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  id,
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

const mockLinode = linodeFactory.build({
  id: kubeLinodeFactory.build().instance_id ?? undefined,
  label: resource,
  region: 'us-ord',
});

const mockAccount = accountFactory.build();

const mockRegion = regionFactory.build({
  capabilities: ['Kubernetes'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    alerts: ['Kubernetes'],
    metrics: ['Kubernetes'],
  },
});

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockedEnterpriseClusters = [
  kubernetesClusterFactory.build({
    label: resource,
    region: 'us-ord',
    tier: 'enterprise',
  }),
  kubernetesClusterFactory.build({
    label: 'enterprise-cluster-us-east',
    region: 'us-ord',
    tier: 'enterprise',
  }),
];

describe('Integration Tests for Linode Dashboard Preferences', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetLinodes([mockLinode]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetClusters(mockedEnterpriseClusters);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 9,
        groupBy: ['entity_id', 'state'],
        widgets: {
          'Ready Worker Nodes': {
            label: 'Ready Worker Nodes',
            timeGranularity: {
              unit: 'hr',
              value: 1,
            },
          },
        },
        region: 'us-ord',
        resources: ['1'],
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
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get(`[data-qa-value="Clusters ${resource}"]`)
          .should('be.visible')
          .should('have.text', resource);
      });

    ui.button.findByTitle('Filters').click();
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
        '[data-qa-autocomplete="Region"] input[data-testid="textfield-input"]'
      ).should('have.value', 'US, Chicago, IL (us-ord)');

      cy.get('[data-qa-autocomplete="Clusters"]').within(() => {
        // get the first chip using only data attributes
        cy.get('[data-tag-index="0"]').should('have.text', resource);

        // check the helper text
        cy.get('[data-qa-textfield-helper-text="true"]').should(
          'contain.text',
          'Select up to 10 Clusters'
        );
      });

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
    cy.scrollTo('top');
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

      comparePreferences(expectedAclpPreference, responseBody?.aclpPreference);
      comparePreferences(expectedAclpPreference, request.body.aclpPreference);
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
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('not.exist');
      cy.get(`[data-qa-value="Cluster ${resource}"]`).should('not.exist');
    });
    cy.wait('@updateRegionPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 9,
        groupBy: ['entity_id', 'state'],
        widgets: {
          'Ready Worker Nodes': {
            label: 'Ready Worker Nodes',
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

  it('clears the Cluster and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Clusters"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="Region US, Chicago, IL"]').should('be.visible');
      cy.get(`[data-qa-value="Clusters ${resource}"]`).should('not.exist');
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 9,
        groupBy: ['entity_id', 'state'],
        region: 'us-ord',
        resources: [],
        widgets: {
          'Ready Worker Nodes': {
            label: 'Ready Worker Nodes',
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
