/**
 * @file Integration Tests for CloudPulse Dbass Dashboard.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCloudPulseJWEToken,
  mockGetCloudPulseDashboard,
  mockCreateCloudPulseMetrics,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { ui } from 'support/ui';
import { widgetDetails } from 'support/constants/widgets';
import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { Database } from '@linode/api-v4';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import type { Flags } from 'src/featureFlags';

const timeDurationToSelect = 'Last 24 Hours';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

const {
  metrics,
  id,
  serviceType,
  dashboardName,
  engine,
  clusterName,
  nodeType,
} = widgetDetails.dbaas;

const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ title, yLabel, name, unit }) => {
    return widgetFactory.build({
      label: title,
      y_label: yLabel,
      metric: name,
      unit,
    });
  }),
});

const metricDefinitions = {
  data: metrics.map(({ title, name, unit }) =>
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
  label: clusterName,
  type: engine,
  region: mockRegion.label,
  version: '1',
  status: 'provisioning',
  cluster_size: 1,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
});
const extendDatabaseMock: Database = databaseFactory.build({
  label: 'updated-dbass-mock',
  type: engine,
  region: mockRegion.label,
  version: '1',
  status: 'provisioning',
  cluster_size: 1,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
});

describe('Integration Tests for Applied Filters', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    //mockGetLinodes([mockLinode]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices(serviceType).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock, extendDatabaseMock]);

    // navigate to the cloudpulse page
    cy.visitWithLogin('monitor');

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
    //Select a Database Engine from the autocomplete input.
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

    //Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

     cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Database Engine ${engine}"]`)
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
      cy.get(`[data-qa-value="Node Type ${nodeType}"]`)
      cy.get(`[data-qa-value="Database Clusters ${databaseMock.label}"]`)
    });
  });

  it('dont create any global filter and check the applied filters', () => {
    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get('h3').should('not.exist');
    });
  });

  it('apply only database engine and verify applied filters', () => {
    //Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();
    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
     cy.get(`[data-qa-value="Database Engine ${engine}"]`)
    });
  });

  it('apply only regions  and verify applied filters', () => {
    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
     cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
    });
  });

  it('apply only node type  and verify applied filters', () => {
    //Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Node Type ${nodeType}"]`)
    });
  });
  it('should update and verify that the applied global filters are reflected in the filter section', () => {
    // Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    //Select a Database Engine from the autocomplete input.
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

    //Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${'Primary'}{enter}`);

    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    //Collapse the Filters section
    ui.button.findByTitle('Filters').should('be.visible').click();
    cy.get('[data-testid="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Database Engine PostgreSQL"]`)
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
      cy.get(`[data-qa-value="Node Type Primary"]`)
      cy.get(`[data-qa-value="Database Clusters ${databaseMock.label}"]`)
      cy.get(`[data-qa-value="Database Clusters ${extendDatabaseMock.label}"]`)
    });
  });
});
