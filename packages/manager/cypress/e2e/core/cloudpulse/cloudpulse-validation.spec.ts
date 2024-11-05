/**
 * @file @file Error Handling Tests for CloudPulse Dashboard.
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
  accountFactory,
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
import { mockGetAccount } from 'support/intercepts/account';

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
const mockAccount = accountFactory.build();

describe('Tests for API error handling', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
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
    cy.intercept(
      'GET',
      apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
      { statusCode: 500, body: { errors: [{ reason: 'Bad Request' }] } }
    ).as('getMetricDefinitions');

    cy.visitWithLogin('monitor/cloudpulse');

    //  Wait for the API calls .
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

    //  Wait for the API calls .
    cy.wait('@getMetricDefinitions');
    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .and('have.text', 'Error loading the definitions of metrics.');
  });

  it('displays error message when services API fails', () => {
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
  it('displays error message when token API fails', () => {
    cy.intercept('POST', apiMatcher(`/monitor/services/${serviceType}/token`), {
      statusCode: 500,
      body: {
        errors: [{ reason: 'Bad Request' }],
      },
    });

    cy.visitWithLogin('monitor/cloudpulse');

    //  Wait for the API calls .
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

  it('displays error message when Dashboards API fails', () => {
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

    //  Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Assert that the error message for fetching the dashboards is displayed correctly.
    cy.get('[data-qa-textfield-error-text="Dashboard"]')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text).to.equal('Failed to fetch the dashboards.');
      });
  });

  it('displays error message when dashboard details API fails', () => {
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

    //  Wait for the API calls .
    cy.wait(['@fetchServices', '@fetchDashboard']);

    cy.get('[data-qa-error-msg="true"]')
      .should('be.visible')
      .and('have.text', 'Failed to fetch the dashboard details.');
  });

  it(`displays error message when regions API fails`, () => {
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

  it('displays error message when instace API fails', () => {
    cy.intercept('GET', apiMatcher(`databases/instances*`), {
      statusCode: 500,
      body: { errors: [{ reason: 'Bad Request' }] },
    });

    cy.visitWithLogin('monitor/cloudpulse');

    //  Wait for the API calls .
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
