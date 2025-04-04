/**
 * @file Integration Tests for CloudPulse Dbass Dashboard.
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
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  widgetFactory,
} from 'src/factories';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const timeDurationToSelect = 'Last 24 Hours';

const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
      supportedRegionIds: '',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};

const {
  clusterName,
  dashboardName,
  engine,
  id,
  metrics,
  nodeType,
  serviceType,
} = widgetDetails.dbaas;

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

const metricDefinitions = {
  data: metrics.map(({ name, title, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
    })
  ),
};
const mockAccount = accountFactory.build();
const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});
const databaseMock: Database = databaseFactory.build({
  cluster_size: 2,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
  label: clusterName,
  region: mockRegion.label,
  status: 'provisioning',
  type: engine,
  version: '1',
});
const extendDatabaseMock: Database = databaseFactory.build({
  cluster_size: 1,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
  label: 'updated-dbass-mock',
  region: mockRegion.label,
  status: 'provisioning',
  type: engine,
  version: '1',
});

describe('Integration Tests for Applied Filters', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock, extendDatabaseMock]);

    // navigate to the cloudpulse page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();
  });

  it('should verify that the applied global filters are reflected in the filter section', () => {
    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Select a resource from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(`${databaseMock.label}{enter}`)
      .click();

    cy.findByText(databaseMock.label).should('be.visible');

    cy.get('body').click('topRight');

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Database Engine ${engine}"]`)
        .should('be.visible')
        .should('have.text', engine);

      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');

      cy.get(`[data-qa-value="Node Type ${nodeType}"]`)
        .should('be.visible')
        .should('have.text', nodeType);

      cy.get(`[data-qa-value="Database Clusters ${clusterName}"]`)
        .should('be.visible')
        .should('have.text', clusterName);
    });
  });

  it('dont create any global filter and check the applied filters', () => {
    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get('h3').should('not.exist');
    });
  });

  it('apply only database engine and verify applied filters', () => {
    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Database Engine ${engine}"]`)
        .should('be.visible')
        .should('have.text', engine);
    });
  });

  it('apply only regions  and verify applied filters', () => {
    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');
    });
  });

  it('should update and verify that the applied global filters are reflected in the filter section', () => {
    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    // Select a resource from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(`${'Select All'}{enter}`)
      .click();

    cy.get('body').click('topRight');

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${'Primary'}{enter}`);

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    // Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Database Engine ${'PostgreSQL'}"]`)
        .should('be.visible')
        .should('have.text', 'PostgreSQL');

      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');

      cy.get('[data-qa-value="Node Type Primary"]')
        .should('be.visible')
        .should('have.text', 'Primary');

      cy.get(`[data-qa-value="Database Clusters ${clusterName}"]`)
        .should('be.visible')
        .should('have.text', clusterName);

      cy.get(`[data-qa-value="Database Clusters ${extendDatabaseMock.label}"]`)
        .should('be.visible')
        .should('have.text', extendDatabaseMock.label);
    });
  });
});
