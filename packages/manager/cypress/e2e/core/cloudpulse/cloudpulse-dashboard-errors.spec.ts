/**
 * @file Error Handling Tests for CloudPulse Dashboard.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCloudPulseJWEToken,
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
  mockGetCloudPulseDashboardByIdError,
  mockGetCloudPulseDashboardsError,
  mockGetCloudPulseMetricDefinitionsError,
  mockGetCloudPulseServicesError,
  mockGetCloudPulseTokenError,
} from 'support/intercepts/cloudpulse';
import { ui } from 'support/ui';
import { widgetDetails } from 'support/constants/widgets';
import {
  accountFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import {
  mockGetRegions,
  mockGetRegionsError,
} from 'support/intercepts/regions';
import {
  mockGetDatabases,
  mockGetDatabasesError,
} from 'support/intercepts/databases';
import { Database } from '@linode/api-v4';
import { mockGetAccount } from 'support/intercepts/account';

/**
 * Verifies the presence and values of specific properties within the aclpPreference object
 * of the request payload. This function checks that the expected properties exist
 * and have the expected values, allowing for validation of user preferences in the application.
 *
 * @param requestPayload - The payload received from the request, containing the aclpPreference object.
 * @param expectedValues - An object containing the expected values for properties to validate against the requestPayload.
 */
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

const mockRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-ord',
  label: 'Chicago, IL',
  country: 'us',
});

const databaseMock: Database = databaseFactory.build({
  label: clusterName,
  type: engine,
  region: mockRegion.id,
  version: '1',
  status: 'provisioning',
  cluster_size: 1,
  engine: 'mysql',
});
const mockAccount = accountFactory.build();

describe('Tests for API error handling', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices(serviceType).as('fetchServices');
    mockCreateCloudPulseJWEToken(serviceType);
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock]).as('getDatabases');
  });

  it('displays error message when metric definitions API fails', () => {
    // Mocking an error response for the 'getMetricDefinitions' API request related to a specific service type.
    mockGetCloudPulseMetricDefinitionsError(
      serviceType,
      'Internal Server Error'
    ).as('getMetricDefinitions');

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
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

    //Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    //  Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(clusterName);

    ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for the API calls .
    cy.wait('@getMetricDefinitions');

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .should('have.text', 'Error loading the definitions of metrics.');
  });

  it('displays error message when services API fails', () => {
    // Mocking an error response for the 'fetchServices' API request.
    mockGetCloudPulseServicesError('Internal Server Error').as('fetchServices');

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait('@fetchServices');

    cy.get('[data-qa-textfield-error-text="Dashboard"]')
      .should('be.visible')
      .should('have.text', 'Failed to fetch the services.');
  });

  it('displays error message when token API fails', () => {
    mockGetCloudPulseTokenError(serviceType, 'Internal Server Error').as(
      'getCloudPulseTokenError'
    );

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

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

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(clusterName);

    ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for the intercepted error response
    cy.wait('@getCloudPulseTokenError');

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .should('have.text', 'Failed to get the authentication token.');
  });

  it('displays error message when Dashboards API fails', () => {
    mockGetCloudPulseServices(serviceType).as('fetchServices');

    // Mocking an error response for the 'fetchDashboard' API request for a specific service type.
    mockGetCloudPulseDashboardsError(serviceType, 'Internal Server Error').as(
      'fetchDashboard'
    );

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Assert that the error message for fetching the dashboards is displayed correctly.
    cy.get('[data-qa-textfield-error-text="Dashboard"]')
      .should('be.visible')
      .should('have.text', 'Failed to fetch the dashboards.');
  });

  it('displays error message when dashboard details API fails', () => {
    // Mocking an error response for the 'getCloudPulseDashboardById' API request for a specific dashboard ID.
    mockGetCloudPulseDashboardByIdError(id, 'Internal Server Error').as(
      'getCloudPulseDashboardError'
    );

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    //  Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    //  Select a region from the dropdown.
    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(clusterName);

    ui.autocompletePopper.findByTitle(clusterName).should('be.visible').click();

    //  Select a node type from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for the intercepted error response
    cy.wait('@getCloudPulseDashboardError');

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .should('have.text', 'Failed to fetch the dashboard details.');
  });

  it('displays error message when regions API fails', () => {
    // Mocking an error response for the 'CloudPulseRegions' API request.
    mockGetRegionsError('Internal Server Error').as(
      'getCloudPulseRegionsError'
    );

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    //  Select a dashboard from the autocomplete input
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    // Wait for the mocked request to complete
    cy.wait('@getCloudPulseRegionsError');

    cy.get('[data-qa-textfield-error-text="Region"]')
      .should('be.visible')
      .should('have.text', 'Failed to fetch Region.');
  });

  it('displays error message when instance API fails', () => {
    // Mocking an error response for the 'CloudPulseDatabaseInstances' API request.
    mockGetDatabasesError('Internal Server Error').as(
      'getDatabaseInstancesError'
    );

    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    //  Select a dashboard from the autocomplete input
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    //  Select a region from the dropdown.
    ui.regionSelect.find().click();

    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    //Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    // Wait for the intercepted request to complete
    cy.wait('@getDatabaseInstancesError');

    cy.get('[data-qa-textfield-error-text="Database Clusters"]')
      .should('be.visible')
      .should('have.text', 'Failed to fetch Database Clusters.');
  });
});
