/**
 * @file Error Handling Tests for CloudPulse DBaaS Dashboard.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCloudPulseJWEToken,
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { ui } from 'support/ui';
import { widgetDetails } from 'support/constants/widgets';
import {
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { extendRegion } from 'support/util/regions';
import { mockGetDatabases } from 'support/intercepts/databases';
import { apiMatcher } from 'support/util/intercepts';
import { Database } from '@linode/api-v4';

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
  region,
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

const mockRegion = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    country: 'us',
  })
);
const databaseMock: Database = databaseFactory.build({
  label: widgetDetails.dbaas.clusterName,
  type: widgetDetails.dbaas.engine,
  region: widgetDetails.dbaas.region,
  version: '1',
  status: 'provisioning',
  cluster_size: 1,
  engine: 'mysql',
});

describe('Tests for API error handling', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices(serviceType).as('fetchServices');
    mockCreateCloudPulseJWEToken(serviceType);
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock]).as('getDatabases');
  });

  it('should return error response when fetching metric definitions API request', () => {
    cy.intercept(
      'GET',
      apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
      { statusCode: 500, body: { errors: [{ reason: 'Bad Request' }] } }
    ).as('getMetricDefinitions');

    cy.visitWithLogin('monitor/cloudpulse');

    //  Wait for the services and dashboard API calls to complete before proceeding.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    //  Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(`${engine}{enter}`)
      .should('be.visible');

    //  Select a region from the dropdown.
    ui.regionSelect.find().click().type(`${region}{enter}`);

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(`${clusterName}{enter}`)
      .click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for the metric definitions API call to resolve.
    cy.wait('@getMetricDefinitions');
    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .and('have.text', 'Error loading the definitions of metrics.');
  });

  it('should return error response when fetching services API request', () => {
    cy.intercept('GET', apiMatcher(`/monitor/services`), {
      statusCode: 500,
      body: {
        errors: [{ reason: 'Bad Request' }],
      },
    }).as('fetchServices');
    cy.visitWithLogin('monitor/cloudpulse');

    cy.get('[data-qa-textfield-error-text="Dashboard"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.equal('Failed to fetch the services.');
      });
  });
  it('should return error response when fetching token API request', () => {
    cy.intercept('POST', apiMatcher(`/monitor/services/${serviceType}/token`), {
      statusCode: 500,
      body: {
        errors: [{ reason: 'Bad Request' }],
      },
    });

    cy.visitWithLogin('monitor/cloudpulse');
    //  Wait for both the fetch services and fetch dashboard API calls to complete.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    //  Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(`${engine}{enter}`)
      .should('be.visible');

    //  Select a region from the dropdown.
    ui.regionSelect.find().click().type(`${region}{enter}`);

    // Select a resource (Database Clusters) from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(`${clusterName}{enter}`)
      .click();

    // Select a Node from the autocomplete input.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .and('have.text', 'Failed to get the authentication token.');
  });

  it('should return error response when fetching Dashboards API Request', () => {
    mockGetCloudPulseServices(serviceType).as('fetchServices');
    cy.intercept(
      'GET',
      apiMatcher(`/monitor/services/${serviceType}/dashboards`),
      {
        statusCode: 500,
        body: { errors: [{ reason: 'Bad Request' }] },
      }
    ).as('fetchDashboard');

    cy.visitWithLogin('monitor/cloudpulse');
    //  Wait for both the fetch services and fetch dashboard API calls to complete.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Assert that the error message for fetching the dashboards is displayed correctly.
    cy.get('[data-qa-textfield-error-text="Dashboard"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.equal('Failed to fetch the dashboards.');
      });
  });

  it('should return error message when the Dashboard details API request fails', () => {
    cy.intercept('GET', apiMatcher(`/monitor/dashboards/${id}`), {
      statusCode: 500,
      body: { errors: [{ reason: 'Bad Request' }] },
    });

    cy.visitWithLogin('monitor/cloudpulse');

    //  Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    //  Select a database engine from the autocomplete input. Verify visibility before interaction.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(`${engine}{enter}`)
      .should('be.visible');

    //  Select a region from the dropdown. Verify visibility before interaction.
    ui.regionSelect.find().click().type(`${region}{enter}`);

    // Select a database cluster from the autocomplete input. Verify visibility before interaction.
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(`${clusterName}{enter}`)
      .click();

    //  Select a node type from the autocomplete input. Verify visibility before interaction.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    //  Wait for the API calls to fetch services and dashboard to resolve.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .and('have.text', 'Failed to fetch the dashboard details.');
  });

  it(`should return error message when the Regions API request fails`, () => {
    cy.intercept('GET', apiMatcher(`regions*`), {
      statusCode: 500,
      body: { errors: [{ reason: 'Bad Request' }] },
    });

    cy.visitWithLogin('monitor/cloudpulse');

    //  Wait for the services and dashboard API calls to resolve before proceeding.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    //  Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    cy.get('[data-qa-textfield-error-text="Region"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.equal('Failed to fetch Region.');
      });
  });

  it('should return error response when fetching db cluster API request', () => {
    cy.intercept('GET', apiMatcher(`databases/instances*`), {
      statusCode: 500,
      body: { errors: [{ reason: 'Bad Request' }] },
    });

    cy.visitWithLogin('monitor/cloudpulse');

    //Wait for the services and dashboard API calls to resolve before proceeding.
    cy.wait(['@fetchServices', '@fetchDashboard']);

    //  Select a dashboard from the autocomplete input
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    //  Select a Node Type from the autocomplete input. Verify visibility before typing.
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    //  Select a region from the dropdown. Click and type the region name.
    ui.regionSelect.find().click().type(`${region}{enter}`);

    //  Select a Database Engine from the autocomplete input. Verify visibility before typing.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(`${engine}{enter}`)
      .should('be.visible');

    cy.get('[data-qa-textfield-error-text="Database Clusters"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.equal('Failed to fetch Database Clusters.');
      });
  });
});
