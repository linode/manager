/**
 * @file Error Handling Tests for CloudPulse DBaaS Dashboard.
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
  kubeLinodeFactory,
  linodeFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { extendRegion } from 'support/util/regions';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { apiMatcher } from 'support/util/intercepts';
import { Database } from '@linode/api-v4';

/**
 * This suite tests error handling on the CloudPulse DBaaS dashboard.
 * Verifies:
 * - Widget loading, title accuracy, and data values.
 * - Error handling for failed API requests.
 * - Widget interactivity (e.g., zoom and filter behavior).
 */
const timeDurationToSelect = 'Last 24 Hours';

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

const mockLinode = linodeFactory.build({
  label: clusterName,
  id: kubeLinodeFactory.build().instance_id ?? undefined,
});

const mockAccount = accountFactory.build();
const mockRegion = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    country: 'us',
  })
);
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

/**
 * Verifies the presence and values of specific properties within the aclpPreference object
 * of the request payload. This function checks that the expected properties exist
 * and have the expected values, allowing for validation of user preferences in the application.
 *
 * @param requestPayload - The payload received from the request, containing the aclpPreference object.
 * @param expectedValues - An object containing the expected values for properties to validate against the requestPayload.
 *    Expected properties may include:
 *    - dashboardId: The ID of the dashboard.
 *    - timeDuration: The selected time duration for metrics.
 *    - engine: The database engine used.
 *    - region: The selected region for the dashboard.
 *    - resources: An array of resource identifiers.
 *    - role: The role associated with the dashboard user.
 */

const databaseMock: Database = databaseFactory.build({
  label: widgetDetails.dbaas.clusterName,
  type: widgetDetails.dbaas.engine,
  region: widgetDetails.dbaas.region,
  version: '1',
  status: 'provisioning',
  cluster_size: 1,
  engine: 'mysql',
  platform: 'rdbms-default',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
});

describe('DbasS API Error Handling', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetAccount(mockAccount);
    mockGetLinodes([mockLinode]);
    mockGetUserPreferences({});
  });

  const statusCodes = [400];
  statusCodes.forEach((statusCode) => {
    it(`should return ${statusCode} error response when fetching metric definitions API Request`, () => {
      // Step 1: Intercept the API call for fetching metric definitions and simulate an error response.
      cy.intercept(
        'GET',
        apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
        {
          statusCode: statusCode, // Use the specified status code (e.g., 400)
          body: {
            errors: [
              {
                reason: 'Bad Request', // Specify the reason for the error
              },
            ],
          },
        }
      ).as('getMetricDefinitions'); // Alias for the intercepted API call

      // Step 2: Mock the required API responses for dashboards and services.
      mockGetCloudPulseDashboards(serviceType, [dashboard]).as(
        'fetchDashboard'
      );
      mockGetCloudPulseServices(serviceType).as('fetchServices');
      mockGetCloudPulseDashboard(id, dashboard);
      mockCreateCloudPulseJWEToken(serviceType);
      mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
        'getMetrics'
      );
      mockGetRegions([mockRegion]);
      mockGetDatabases([databaseMock]).as('getDatabases');

      // Step 3: Navigate to the CloudPulse page after logging in.
      cy.visitWithLogin('monitor/cloudpulse');

      // Step 4: Wait for the services and dashboard API calls to complete before proceeding.
      cy.wait(['@fetchServices', '@fetchDashboard']);

      // Step 5: Selecting a dashboard from the autocomplete input.
      ui.autocomplete
        .findByLabel('Dashboard')
        .should('be.visible') // Ensure the dashboard input is visible
        .type(`${dashboardName}{enter}`) // Type the dashboard name and select it
        .should('be.visible'); // Confirm the selection is visible

      // Step 6: Select a Database Engine from the autocomplete input.
      ui.autocomplete
        .findByLabel('Database Engine')
        .should('be.visible') // Ensure the input is visible
        .type(`${engine}{enter}`) // Type the engine name and select it
        .should('be.visible'); // Confirm the selection is visible

      // Step 7: Select a region from the dropdown.
      ui.regionSelect.find().click().type(`${region}{enter}`); // Click and select the region

      // Step 8: Select a resource (Database Clusters) from the autocomplete input.
      ui.autocomplete
        .findByLabel('Database Clusters')
        .should('be.visible') // Ensure the input is visible
        .type(`${clusterName}{enter}`) // Type the cluster name and select it
        .click(); // Click to confirm selection
      cy.findByText(clusterName).should('be.visible'); // Verify the selected cluster is visible

      // Step 9: Select a Node from the autocomplete input.
      ui.autocomplete
        .findByLabel('Node Type')
        .should('be.visible') // Ensure the input is visible
        .type(`${nodeType}{enter}`); // Type the node type and select it

      // Step 10: Wait for the metric definitions API call to resolve.
      cy.wait('@getMetricDefinitions'); // Wait for the API call to complete

      // Step 11: Assert that the appropriate error message is displayed on the UI.
      cy.get('[data-qa-error-msg="true"]') // Select the error message element
        .should('be.visible') // Ensure the error message element is visible
        .and('have.text', 'Error loading metric definitions'); // Validate the displayed error message
    });

    it(`should return ${statusCode} error response when fetching Services API Request`, () => {
      // Step 1: Intercept the API call for fetching services and simulate a specific error response.
      cy.intercept('GET', apiMatcher(`/monitor/services`), {
        statusCode: statusCode, // Use the provided status code (e.g., 400)
        body: {
          errors: [
            {
              reason: 'Bad Request', // Define the reason for the error
            },
          ],
        },
      }).as('fetchServices'); // Alias for the intercepted API call

      // Step 2: Visit the CloudPulse page after logging in.
      cy.visitWithLogin('monitor/cloudpulse'); // Simulate user navigation to the relevant page

      // Step 3: Wait for the API call to complete and capture the response.
      cy.wait('@fetchServices'); // Wait for the services API call to complete

      // Step 4: Check for any loading indicators or placeholder texts (optional).
      cy.get('[data-qa-loading-indicator]').should('not.exist'); // Ensure no loading indicators are present

      // Step 5: Assert that the appropriate error message for the services fetch is displayed on the UI.
      cy.get('[data-qa-textfield-error-text="Dashboard"]') // Select the error message element for the services
        .should('be.visible') // Verify that the error message element is visible
        .invoke('text') // Retrieve the text content of the error message element
        .then((text) => {
          // Step 6: Check if the text matches the expected error message.
          expect(text.trim()).to.equal(`Failed to fetch the services`); // Validate the displayed error message
        });
    });

    it(`should return ${statusCode} error response when fetching Dashboards API Request`, () => {
      // Step 1: Mock the API response for fetching cloud pulse services.
      mockGetCloudPulseServices(serviceType).as('fetchServices'); // Mock API call for services

      // Step 2: Intercept the API call for fetching dashboards and simulate a 400 Bad Request response.
      cy.intercept(
        'GET',
        apiMatcher(`/monitor/services/${serviceType}/dashboards`),
        {
          statusCode: statusCode, // Use the status code defined in the test
          body: {
            errors: [
              {
                reason: 'Bad Request', // Specify the error reason
              },
            ],
          },
        }
      ).as('fetchDashboard'); // Alias for the intercepted API call

      // Step 3: Navigate to the CloudPulse monitoring page after logging in.
      cy.visitWithLogin('monitor/cloudpulse');

      // Step 4: Wait for both the fetch services and fetch dashboard API calls to complete.
      cy.wait(['@fetchServices', '@fetchDashboard']); // Wait for the mocked API calls

      // Step 5: Assert that the error message for fetching the dashboards is displayed correctly.
      cy.get('[data-qa-textfield-error-text="Dashboard"]') // Select the error message element
        .should('be.visible') // Ensure the error message element is visible
        .invoke('text') // Get the text content of the element
        .then((text) => {
          expect(text.trim()).to.equal(`Failed to fetch the dashboards`); // Check if the message matches the expected error
        });
    });

    it(`should return ${statusCode} error message when the Dashboard details API request fails`, () => {
      // Step 1: Set up mock responses for fetching services and dashboards to prepare the test environment.
      mockGetCloudPulseServices(serviceType).as('fetchServices'); // Mock fetching services
      mockGetCloudPulseDashboards(serviceType, [dashboard]).as(
        'fetchDashboard'
      ); // Mock fetching the dashboard

      // Step 2: Intercept the API call for fetching dashboard details by ID and simulate a 400 Bad Request error response.
      cy.intercept('GET', apiMatcher(`/monitor/dashboards/${id}`), {
        statusCode: statusCode, // Use the status code defined in the test
        body: {
          errors: [
            {
              reason: 'Bad Request', // Specify the error reason
            },
          ],
        },
      }).as('fetchDashboardById'); // Alias for the intercept to be used later

      // Step 3: Mock additional necessary responses for regions and databases.
      mockGetRegions([mockRegion]); // Mock fetching regions
      mockGetDatabases([databaseMock]).as('getDatabases'); // Mock fetching databases

      // Step 4: Navigate to the CloudPulse monitoring page after logging in.
      cy.visitWithLogin('monitor/cloudpulse');

      // Step 5: Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
      ui.autocomplete
        .findByLabel('Dashboard')
        .should('be.visible') // Check that the dashboard input is visible
        .type(`${dashboardName}{enter}`) // Type the dashboard name and press enter
        .should('be.visible'); // Ensure the dashboard input remains visible

      // Step 6: Select a time duration from the autocomplete input. Verify visibility before interaction.
      ui.autocomplete
        .findByLabel('Time Range')
        .should('be.visible') // Check that the time range input is visible
        .type(`${timeDurationToSelect}{enter}`) // Type the time duration and press enter
        .should('be.visible'); // Ensure the time range input remains visible

      // Step 7: Select a database engine from the autocomplete input. Verify visibility before interaction.
      ui.autocomplete
        .findByLabel('Database Engine')
        .should('be.visible') // Check that the database engine input is visible
        .type(`${engine}{enter}`) // Type the database engine and press enter
        .should('be.visible'); // Ensure the database engine input remains visible

      // Step 8: Select a region from the dropdown. Verify visibility before interaction.
      ui.regionSelect.find().click().type(`${region}{enter}`); // Click and select the region from the dropdown

      // Step 9: Select a database cluster from the autocomplete input. Verify visibility before interaction.
      ui.autocomplete
        .findByLabel('Database Clusters')
        .should('be.visible') // Check that the database clusters input is visible
        .type(`${clusterName}{enter}`) // Type the cluster name and press enter
        .click(); // Click to select the cluster
      cy.findByText(clusterName).should('be.visible'); // Ensure the selected cluster is visible

      // Step 10: Select a node type from the autocomplete input. Verify visibility before interaction.
      ui.autocomplete
        .findByLabel('Node Type')
        .should('be.visible') // Check that the node type input is visible
        .type(`${nodeType}{enter}`); // Type the node type and press enter

      // Step 11: Wait for the API calls to fetch services and dashboard to resolve.
      cy.wait(['@fetchServices', '@fetchDashboard']);

      // Step 12: Assert that the error message for fetching the dashboard details is displayed correctly.
      cy.get('[data-qa-error-msg="true"]') // Select the error message element
        .should('be.visible') // Ensure the error message is visible
        .and('have.text', 'Failed to fetch the dashboard details'); // Check if the message matches the expected error
    });

    it(`should return ${statusCode} error message when the Regions API request fails`, () => {
      // Step 1: Set up mock responses for various API endpoints to prepare the test environment.
      mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions); // Mock metric definitions
      mockGetCloudPulseDashboards(serviceType, [dashboard]).as(
        'fetchDashboard'
      ); // Mock fetching the dashboard
      mockGetCloudPulseServices(serviceType).as('fetchServices'); // Mock fetching the services
      mockGetCloudPulseDashboard(id, dashboard); // Mock fetching a specific dashboard by ID
      mockCreateCloudPulseJWEToken(serviceType); // Mock creating a JWE token for authentication
      mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
        'getMetrics'
      ); // Mock fetching metrics

      // Step 2: Intercept the API call for fetching regions and simulate a 400 Bad Request error response.
      cy.intercept('GET', apiMatcher(`regions*`), {
        statusCode: statusCode, // Use the status code defined in the test
        body: {
          errors: [
            {
              reason: 'Bad Request', // Specify the error reason
            },
          ],
        },
      }).as('fetchRegion'); // Alias for the intercept to be used later

      // Step 3: Navigate to the CloudPulse monitoring page after logging in.
      cy.visitWithLogin('monitor/cloudpulse');

      // Step 4: Wait for the services and dashboard API calls to resolve before proceeding.
      cy.wait(['@fetchServices', '@fetchDashboard']);

      // Step 5: Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
      ui.autocomplete
        .findByLabel('Dashboard')
        .should('be.visible') // Check that the dashboard input is visible
        .type(`${dashboardName}{enter}`) // Type the dashboard name and press enter
        .should('be.visible'); // Ensure the dashboard input remains visible

      // Step 6: Assert that the error message for fetching Regions is displayed correctly.
      cy.get('[data-qa-textfield-error-text="Region"]') // Select the error message element
        .should('be.visible') // Check that the error message is visible
        .invoke('text') // Get the text content of the error message
        .then((text) => {
          // Step 7: Verify that the displayed error message matches the expected message.
          expect(text.trim()).to.equal(`Failed to fetch Region`); // Check if the message is as expected
        });
    });

    it(`should return ${statusCode} error response when fetching DB Cluster API Request`, () => {
      // Step 1: Set up mock responses for various API endpoints to prepare the test environment.
      mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions).as(
        'fetchMetricDefinitions'
      ); // Mock metric definitions
      mockGetCloudPulseDashboards(serviceType, [dashboard]).as(
        'fetchDashboard'
      ); // Mock fetching the dashboard
      mockGetCloudPulseServices(serviceType).as('fetchServices'); // Mock fetching the services
      mockGetCloudPulseDashboard(id, dashboard); // Mock fetching a specific dashboard by ID
      mockCreateCloudPulseJWEToken(serviceType); // Mock creating a JWE token for authentication
      mockGetRegions([mockRegion]); // Mock fetching the regions available

      // Step 2: Intercept the API call for fetching DB clusters and simulate a 400 Bad Request error response.
      cy.intercept('GET', apiMatcher(`databases/instances*`), {
        statusCode: statusCode, // Use the status code defined in the loop
        body: {
          errors: [
            {
              reason: 'Bad Request', // Specify the error reason
            },
          ],
        },
      }).as('fetchCluster'); // Alias for the intercept to be used later

      // Step 3: Navigate to the CloudPulse monitoring page after logging in.
      cy.visitWithLogin('monitor/cloudpulse');

      // Step 4: Wait for the services and dashboard API calls to resolve before proceeding.
      cy.wait(['@fetchServices', '@fetchDashboard']);

      // Step 5: Select a dashboard from the autocomplete input. Verify that the input is visible before typing.
      ui.autocomplete
        .findByLabel('Dashboard')
        .should('be.visible') // Check that the dashboard input is visible
        .type(`${dashboardName}{enter}`) // Type the dashboard name and press enter
        .should('be.visible'); // Ensure the dashboard input remains visible

      // Step 6: Select a Node Type from the autocomplete input. Verify visibility before typing.
      ui.autocomplete
        .findByLabel('Node Type')
        .should('be.visible') // Check that the Node Type input is visible
        .type(`${nodeType}{enter}`); // Type the node type and press enter

      // Step 7: Select a region from the dropdown. Click and type the region name.
      ui.regionSelect.find().click().type(`${region}{enter}`); // Click on the region dropdown and select the region

      // Step 8: Select a Database Engine from the autocomplete input. Verify visibility before typing.
      ui.autocomplete
        .findByLabel('Database Engine')
        .should('be.visible') // Check that the Database Engine input is visible
        .type(`${engine}{enter}`) // Type the engine name and press enter
        .should('be.visible'); // Ensure the engine input remains visible

      // Step 9: Assert that the error message for fetching Database Clusters is displayed correctly.
      cy.get('[data-qa-textfield-error-text="Database Clusters"]') // Select the error message element
        .should('be.visible') // Check that the error message is visible
        .invoke('text') // Get the text content of the error message
        .then((text) => {
          // Step 10: Verify that the displayed error message matches the expected message.
          expect(text.trim()).to.equal(`Failed to fetch Database Clusters`); // Check if the message is as expected
        });
    });
  });
});
