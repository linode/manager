/**
 * @file Integration Tests for CloudPulse nodebalancer Dashboard.
 */
import {
  linodeFactory,
  nodeBalancerFactory,
  regionFactory,
} from '@linode/utilities';
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
  flagsFactory,
  kubeLinodeFactory,
  widgetFactory,
} from 'src/factories';

const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics, region, resource } =
  widgetDetails.nodebalancer;
const serviceType = 'nodebalancer';
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

const mockRegion = regionFactory.build({
  capabilities: ['NodeBalancers'],
  id: 'us-east',
  label: 'Newark, NJ, USA',
  monitors: {
    metrics: ['NodeBalancers'],
    alerts: [],
  },
});

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockLinode = linodeFactory.build({
  id: kubeLinodeFactory.build().instance_id ?? undefined,
  label: resource,
  region: 'us-east',
});
const mockNodeBalancer = nodeBalancerFactory.build({
  label: resource,
  region: 'us-east',
});
describe('Integration Tests for Nodebalancer Dashboard ', () => {
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
    mockGetRegions([mockRegion]);
    mockGetLinodes([mockLinode]);
    mockGetNodeBalancers([mockNodeBalancer]);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 3,
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
        port: '81',
        groupBy: ['entity_id', 'state'],
      },
    }).as('fetchPreferences');

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices']);

    ui.button.findByTitle('Filters').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Newark, NJ, USA"]`)
          .should('be.visible')
          .should('have.text', 'US, Newark, NJ, USA');

        cy.get(`[data-qa-value="Nodebalancers ${resource}"]`)
          .should('be.visible')
          .should('have.text', resource);

        cy.get(`[data-qa-value="Ports 81"]`)
          .should('be.visible')
          .should('have.text', 81);
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
      'updateRegionPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Region"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify none of these applied filters exist after clear
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('[data-qa-value="US, Newark, NJ, USA"]').should('not.exist');
      cy.get(`[data-qa-value="Nodebalancers: ${resource}"]`).should(
        'not.exist'
      );
      cy.get(`[data-qa-value="Ports 81"]`)
        .should('be.visible')
        .should('have.text', 81);
    });
    cy.wait('@updateRegionPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 3,
        groupBy: ['entity_id', 'state'],
        port: '81',
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

      comparePreferences(responseBody?.aclpPreference, expectedAclpPreference);
      comparePreferences(request.body.aclpPreference, expectedAclpPreference);
    });
  });

  it('clears the Nodebalancers Resource filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.get('[data-qa-autocomplete="Nodebalancers"]')
      .find('button[aria-label="Clear"]')
      .click();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      // Region chip
      cy.get('[data-qa-value="Region US, Newark, NJ, USA"]').should(
        'be.visible'
      );

      // Nodebalancer chip (not exist)
      cy.get(`[data-qa-value="Nodebalancers: ${resource}"]`).should(
        'not.exist'
      );

      // Port chip
      cy.get('[data-qa-value="Ports 81"]')
        .should('be.visible')
        .should('have.text', '81');
    });

    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 3,
        groupBy: ['entity_id', 'state'],
        port: '81',
        region: 'us-east',
        resources: [],
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

  it.only('clears the Port Filter and verifies updated user preferences', () => {
    cy.intercept('PUT', apiMatcher('profile/preferences')).as(
      'updateDBClustersPreference'
    );
    // clear the Region filter
    cy.findByPlaceholderText('e.g., 80,443,3000').clear();

    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      // Region chip
      cy.get('[data-qa-value="Region US, Newark, NJ, USA"]').should(
        'be.visible'
      );

      // Nodebalancer chip (not exist)
      cy.get(`[data-qa-value="Nodebalancers ${resource}"]`).should(
        'be.visible'
      );

      // Port chip
      cy.get('[data-qa-value="Ports 81"]').should('not.exist');
    });
    cy.wait('@updateDBClustersPreference').then(({ request, response }) => {
      const responseBody =
        response?.body &&
        (typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body);

      const expectedAclpPreference = {
        dashboardId: 3,
        groupBy: ['entity_id', 'state'],
        region: 'us-east',
        resources: ['1'],
        port: '',
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
