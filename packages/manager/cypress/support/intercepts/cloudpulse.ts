/**
 * Intercepts request to metrics requests for a cloud pulse.
 *
 * @returns Cypress chainable.
 */

import { cloudPulseServiceMap } from 'support/constants/cloudpulse';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { randomString } from 'support/util/random';
import { makeResponse } from 'support/util/response';

import type {
  Alert,
  CloudPulseMetricsResponse,
  CreateAlertDefinitionPayload,
  Dashboard,
  MetricDefinition,
  NotificationChannel,
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
  metricDefinitions: MetricDefinition[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/metric-definitions`),
    paginateResponse(metricDefinitions)
  );
};

/**
 * Mocks the API response for the '/monitor/services' endpoint with the provided service types.
 * This function intercepts the GET request for the specified API and returns a mocked response
 * with service types, either a single service type or multiple service types.
 * @param {string | string[]} serviceTypes - A single service type (e.g., 'linode') or an array of service types
 * @returns {Cypress.Chainable<null>} - Returns a Cypress chainable object to continue the test.
 */

export const mockGetCloudPulseServices = (
  serviceTypes: string[]
): Cypress.Chainable<null> => {
  const services = serviceTypes.map((serviceType) => ({
    label: cloudPulseServiceMap[serviceType] || 'dbaas',
    service_type: serviceType,
  }));
  return cy.intercept(
    'GET',
    apiMatcher('/monitor/services'),
    paginateResponse(services)
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
 * @param {string} serviceType - The service type for which the metric definitions are being mocked.
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseMetricDefinitionsError = (
  serviceType: string,
  errorMessage: string,
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
 * @param {string} serviceType - The service type for which the token retrieval request is being mocked.
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseTokenError = (
  serviceType: string,
  errorMessage: string,
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
 *  @param {string} serviceType - The service type for which the dashboards retrieval request is being mocked.
 *  @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseDashboardsError = (
  serviceType: string,
  errorMessage: string,
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
 * @param {string} id - The ID of the dashboard to be retrieved.
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetCloudPulseDashboardByIdError = (
  id: number,
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/dashboards/${id}`),
    makeErrorResponse(errorMessage, status)
  );
};

/**
 * Mocks the API response for retrieving alert definitions for a given service type and alert ID.
 * This is useful for testing the behavior of the system when fetching alert definitions.
 *
 * @param {string} serviceType - The type of the service for which we are mocking the alert definition (e.g., 'dbaas').
 * @param {number} id - The unique identifier for the alert definition to be retrieved.
 * @param {Alert} alert - The mock alert object that should be returned by the API in place of a real response.
 *
 * @returns {Cypress.Chainable<null>} A Cypress chainable object that represents the intercepted API call.
 */

export const mockGetAlertDefinitions = (
  serviceType: string,
  id: number,
  alert: Alert
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/alert-definitions/${id}`),
    makeResponse(alert)
  );
};

/**
 * Mocks the API response for retrieving all alert definitions from the monitoring service.
 * This function intercepts a GET request to fetch alert definitions and returns a mock
 * response, simulating the behavior of the real API by providing a list of alert definitions.
 *
 * The mock response is paginated, with a page size of 500, allowing the test to simulate
 * the scenario where the system is retrieving a large set of alert definitions.
 *
 * @param {Alert[]} alert - An array of `Alert` objects to mock as the response. This should
 *                          represent the alert definitions being fetched by the API.
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted
 */

export const mockGetAllAlertDefinitions = (
  alert: Alert[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('/monitor/alert-definitions*'),
    paginateResponse(alert)
  );
};

/**
 * Mocks the API response for retrieving all alert channels from the monitoring service.
 * This function intercepts a GET request to fetch alert channels and returns a mock
 * response, simulating the behavior of the real API by providing a list of alert channels.
 *
 * The mock response is created using the provided `channel` object, allowing the test
 * to simulate various scenarios with different alert channel configurations.
 *
 * @param {NotificationChannel} channel - An object representing the notification channel to mock as the response.
 *                                        This should represent the alert channel being fetched by the API.
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted request.
 */
export const mockGetAlertChannels = (
  channel: NotificationChannel[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('/monitor/alert-channels*'),
    paginateResponse(channel)
  );
};
/**
 * Mocks the API response for creating a new alert definition in the monitoring service.
 * This function intercepts a POST request to create alert definitions and returns a mock
 * response, simulating the behavior of the real API by returning the alert definition
 * that was submitted in the request.
 *
 * The mock response is created using the provided `createAlertRequest` object, allowing
 * the test to simulate various scenarios with different alert definitions.
 *
 * @param {string} serviceType - The type of service for which the alert definition is being created.
 *                               This could be 'linode', 'dbaas', or another service type supported by the API.
 * @param {CreateAlertDefinitionPayload} createAlertRequest
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted request.
 */
export const mockCreateAlertDefinition = (
  serviceType: string,
  mockAlert: Alert
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`/monitor/services/${serviceType}/alert-definitions`),
    makeResponse(mockAlert)
  );
};
/**
 * Mocks the API response for updating an alert definition in the monitoring service.
 * This function intercepts a `PUT` request to update a specific alert definition and returns a mock
 * response, simulating the behavior of the real API by providing the updated alert object.
 *
 * The mock response allows the test to simulate the scenario where the system is successfully
 * updating an alert definition without actually calling the backend API.
 *
 * @param {string} serviceType - The type of service (e.g., "web", "database") where the alert
 *                               definition is being updated. This value is part of the URL in the request.
 * @param {number} id - The unique identifier of the alert definition being updated. This ID is part
 *                      of the URL in the request.
 * @param {Alert} alert - The updated `Alert` object that will be returned as the mock response.
 *                        This object represents the new alert definition.
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted
 *                                     `PUT` request and the mock response.
 */
export const mockUpdateAlertDefinitions = (
  serviceType: string,
  id: number,
  alert: Alert
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/monitor/services/${serviceType}/alert-definitions/${id}`),
    makeResponse(alert)
  );
};
/**
 * Mocks the API response for retrieving alert definitions in the monitoring service.
 * This function intercepts a `GET` request to fetch a list of alert definitions for a specific
 * service type and returns a mock response, simulating the behavior of the real API.
 *
 * The mock response allows the test to simulate the scenario where the system is retrieving
 * the alert definitions without actually calling the backend API.
 *
 * @param {string} serviceType - The type of service (e.g., "dbaas", "web") for which the alert
 *                               definitions are being retrieved. This value is part of the URL in the request.
 * @param {Alert[]} alert - An array of `Alert` objects that will be returned as the mock response.
 *                          These objects represent the alert definitions being fetched.
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted
 *                                      `GET` request and the mock response, allowing subsequent
 *                                      Cypress commands to be chained.
 */

export const mockGetAlertDefinition = (
  serviceType: string,
  alert: Alert[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/monitor/services/${serviceType}/alert-definitions`),
    paginateResponse(alert)
  );
};

/**
 * Mocks the API response for adding an entity to an alert definition in the monitoring service.
 * This function intercepts a 'POST' request to associate a specific entity with an alert definition
 * and returns a mock response, simulating the behavior of the real API.
 *
 * The mock response simulates the scenario where the system is successfully associating the
 * entity with the alert definition without actually calling the backend API.
 *
 * @param {string} serviceType - The type of service (e.g., "dbaas", "Linocde") where the alert
 *                               definition is being added. This value is part of the URL in the request.
 * @param {string} entityId - The unique identifier of the entity being associated with the alert
 *                            definition. This ID is part of the URL in the request.
 * @param {Object} data - The data object containing the `alert-definition-id` being added to the entity.
 *                        This object contains the alert definition that will be associated with the entity.
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted
 *                                      'POST' request and the mock response, allowing subsequent
 *                                      Cypress commands to be chained.
 */

export const mockAddEntityToAlert = (
  serviceType: string,
  entityId: string,
  data: { 'alert-definition-id': number }
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(
      `/monitor/service/${serviceType}/entity/${entityId}/alert-definition`
    ),
    paginateResponse(data)
  );
};

/**
 * Mocks the API response for adding an entity to an alert definition in the monitoring service.
 * This function intercepts a 'DELETE' request to associate a specific entity with an alert definition
 * and returns a mock response, simulating the behavior of the real API.
 *
 * The mock response simulates the scenario where the system is successfully associating the
 * entity with the alert definition without actually calling the backend API.
 *
 * @param {string} serviceType - The type of service (e.g., "dbaas", "Linode") where the alert
 *                               definition is being added. This value is part of the URL in the request.
 * @param {string} entityId - The unique identifier of the entity being associated with the alert
 *                            definition. This ID is part of the URL in the request.
 *
 * @param {number} alertId - The unique identifier of the alert definition from which the entity
 *                           is being removed. This ID is part of the URL in the request.
 *
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object that represents the intercepted
 *                                      'DELETE' request and the mock response, allowing subsequent
 *                                      Cypress commands to be chained.
 */

export const mockDeleteEntityFromAlert = (
  serviceType: string,
  entityId: string,
  id: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(
      `/monitor/service/${serviceType}/entity/${entityId}/alert-definition/${id}`
    ),
    {
      statusCode: 200,
    }
  );
};

/**
 * Intercepts and mocks – Indicates enabling/disabling alerts with error handling.
 *
 * @param {string} serviceType - The type of service for which the alert definition belongs.
 * @param {number} id - The unique identifier of the alert definition.
 * @param {string} errorMessage - The error message to be returned in the response.
 * @param {number} [status=500] - The HTTP status code for the error response (default: 500).
 * @returns {Cypress.Chainable<null>} - A Cypress intercept that simulates a failed API request.
 *
 * This function is used in Cypress tests to simulate a failed API call when updating
 * alert definitions. It intercepts `PUT` requests to the specified API endpoint and
 * returns a mock error response.
 */
export const mockUpdateAlertDefinitionsError = (
  serviceType: string,
  id: number,
  errorMessage: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/monitor/services/${serviceType}/alert-definitions/${id}`),
    makeErrorResponse(errorMessage, 500)
  );
};
