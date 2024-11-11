/**
 * Intercepts request to metrics requests for a cloud pulse.
 *
 * @returns Cypress chainable.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { randomString } from 'support/util/random';
import { makeResponse } from 'support/util/response';

import type {
  CloudPulseMetricsResponse,
  Dashboard,
  MetricDefinitions,
} from '@linode/api-v4';

/**
 * Intercepts GET requests for metric definitions.
 *
 * This function mocks the API response for requests to the endpoint
 * `dashboardMetricsData`.
 *
 * @returns {Cypress.Chainable<null>} The chainable Cypress object.
 */

export const mockGetCloudPulseMetricDefinitions = (
  serviceType: string,
  metricDefinitions: MetricDefinitions
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
    makeResponse(metricDefinitions)
  );
};

/**
 * Intercepts  GET requests for metric definitions.
 *
 * This function mocks the API response for requests to the endpoint
 * `dashboardMetricsData`.
 *
 * @returns {Cypress.Chainable<null>} The chainable Cypress object.
 */

export const mockGetCloudPulseServices = (
  serviceType: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('/monitor/services'),
    paginateResponse([{ service_type: serviceType }])
  );
};

/**
+ * Intercepts GET requests to fetch dashboards and mocks response.
+ *
+ * @param dashboards - Array of Dashboard objects with which to mock response.
+ * @param serviceType - Service type for which to intercept dashboard request.
+ *
+ * @returns The chainable Cypress object.
+ */

export const mockGetCloudPulseDashboards = (
  serviceType: string,
  dashboards: Dashboard[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/dashboards`),
    paginateResponse(dashboards)
  );
};

/**
 * Intercepts POST requests to the metrics endpoint with a custom mock response.
 *
 * This function allows you to specify a mock response for POST requests
 *
 * @param {any} mockResponse - The mock response to return for the intercepted request.
 * @returns {Cypress.Chainable<null>} The chainable Cypress object.
 */
export const mockCreateCloudPulseMetrics = (
  serviceType: string,
  mockResponse: CloudPulseMetricsResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    `**/monitor/services/${serviceType}/metrics`,
    makeResponse(mockResponse)
  );
};

/**
 * Mocks the API response for fetching a dashboard.
 *
 * This function uses Cypress's `cy.intercept` to intercept GET requests to a specific API endpoint
 * and return a mock response. This is useful for testing how your application handles various
 * responses without making actual network requests.
 *
 * @param {Dashboard} dashboard - The mock response data to return for the dashboard request.
 * @param {number} id - The ID of the dashboard to mock the response for.
 * @returns {Cypress.Chainable<null>} - Returns a Cypress chainable object, allowing for command chaining in tests.
 */

export const mockGetCloudPulseDashboard = (
  id: number,
  dashboard: Dashboard
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/dashboards/${id}`),
    makeResponse(dashboard)
  );
};

/**
 * Mocks the API response for generating a JWE token for a specific service.
 *
 * This function sets up an interception for POST requests to the endpoint that generates
 * JWE tokens for a particular service type. By returning a mock JWE token, you can test
 * how your application handles authentication and authorization without making actual network
 * requests to the backend service.
 *
 * @param {string} service_type - The type of service for which to mock the JWE token request.
 * @returns {Cypress.Chainable<null>} - Returns a Cypress chainable object, enabling command chaining in tests.
 */

export const mockCreateCloudPulseJWEToken = (
  serviceType: string,
  token?: string
): Cypress.Chainable<null> => {
  const mockToken = token ?? randomString(62);
  return cy.intercept(
    'POST',
    apiMatcher(`/monitor/services/${serviceType}/token`),
    makeResponse({ token: mockToken })
  );
};

/**
 * Mocks an error response for the GET request to retrieve metric definitions
 * for a specific service type in CloudPulse.
 *
 * This function intercepts the `GET` request made to the CloudPulse API and
 * simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {string} serviceType - The service type for which the metric definitions are being mocked.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseMetricDefinitionError = (
  errorMessage: string,
  serviceType: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the GET request to retrieve services in CloudPulse.
 *
 * This function intercepts the GET' request made to the CloudPulse API endpoint
 * for fetching services and simulates an error response with a customizable error message
 * and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseServicesError = (
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('/monitor/services'),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the POST request to retrieve a token for a specific service type in CloudPulse.
 *
 * This function intercepts the 'POST' request made to the CloudPulse API endpoint for retrieving a token
 * for a specific service type and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {string} serviceType - The service type for which the token retrieval request is being mocked.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseTokenError = (
  errorMessage: string,
  serviceType: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`/monitor/services/${serviceType}/token`),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the GET request to retrieve dashboards for a specific service type in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving dashboards
 * for a specific service type and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {string} serviceType - The service type for which the dashboards retrieval request is being mocked.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseDashboardsError = (
  errorMessage: string,
  serviceType: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/dashboards`),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the GET request to retrieve a specific dashboard by its ID in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving a dashboard
 * by its ID and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {string} id - The ID of the dashboard to be retrieved.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseDashboardByIdError = (
  errorMessage: string,
  id: number,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/dashboards/${id}`),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the GET request to retrieve database instances in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving database instances
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseDatabaseInstancesError = (
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('databases/instances*'),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks an error response for the GET request to retrieve regions in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving regions
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseRegionsError = (
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('regions*'),
    makeErrorResponse(errorMessage, status)
  );
};
