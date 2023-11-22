import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  APIError,
  Certificate,
  Configuration,
  Loadbalancer,
  Route,
  ServiceTarget,
} from '@linode/api-v4';

/**
 * Intercepts GET request to fetch an AGLB load balancer and mocks response.
 *
 * @param loadBalancer - Load balancer with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancer = (loadBalancer: Loadbalancer) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancer.id}`),
    makeResponse(loadBalancer)
  );
};

/**
 * Intercepts GET request to retrieve AGLB load balancers and mocks response.
 *
 * @param loadBalancers - Load balancers with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancers = (loadBalancers: Loadbalancer[]) => {
  return cy.intercept(
    'GET',
    apiMatcher('/aglb*'),
    paginateResponse(loadBalancers)
  );
};

/**
 * Intercepts GET requests to retrieve AGLB load balancer configurations and mocks response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock configurations.
 * @param configurations - Load balancer configurations with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancerConfigurations = (
  loadBalancerId: number,
  configurations: Configuration[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancerId}/configurations*`),
    paginateResponse(configurations)
  );
};

/**
 * Intercepts DELETE requests to delete an AGLB load balancer configuration.
 *
 * @param loadBalancerId - ID of load balancer for which to delete the configuration.
 * @param configId - ID of the configuration being deleted.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLoadBalancerConfiguration = (
  loadBalancerId: number,
  configId: number
) => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`/aglb/${loadBalancerId}/configurations/${configId}`),
    {}
  );
};

/**
 * Intercepts DELETE requests to delete an AGLB load balancer configuration and returns an error.
 *
 * @param loadBalancerId - ID of load balancer for which to delete the configuration.
 * @param configId - ID of the configuration being deleted.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLoadBalancerConfigurationError = (
  loadBalancerId: number,
  configId: number,
  error: string
) => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`/aglb/${loadBalancerId}/configurations/${configId}`),
    makeResponse({ errors: [{ reason: error }] }, 500)
  );
};

/**
 * Intercepts POST request to create an AGLB configuration.
 *
 * @param loadBalancerId - ID of load balancer for which to create the configuration.
 * @param configuration - The AGLB configuration being created.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLoadBalancerConfiguration = (
  loadBalancerId: number,
  configuration: Configuration
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`/aglb/${loadBalancerId}/configurations`),
    makeResponse(configuration)
  );
};

/**
 * Intercepts POST request to create an AGLB configuration and returns an error.
 *
 * @param loadBalancerId - ID of load balancer for which to create the configuration.
 * @param errors - Array of API errors to mock.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLoadBalancerConfigurationError = (
  loadBalancerId: number,
  errors: APIError[]
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`/aglb/${loadBalancerId}/configurations`),
    makeResponse({ errors }, 500)
  );
};

/**
 * Intercepts GET requests to retrieve AGLB load balancer certificates and mocks response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock certificates.
 * @param certificates - Load balancer certificates with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancerCertificates = (
  loadBalancerId: number,
  certificates: Certificate[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancerId}/certificates*`),
    paginateResponse(certificates)
  );
};

/**
 * Intercepts POST request to upload an AGLB load balancer certificate and mocks a success response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock certificates.
 *
 * @returns Cypress chainable.
 */
export const mockUploadLoadBalancerCertificate = (
  loadBalancerId: number,
  certificate: Certificate
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`/aglb/${loadBalancerId}/certificates`),
    makeResponse(certificate)
  );
};

/**
 * Intercepts DELETE request to delete an AGLB load balancer certificate and mocks a success response.
 *
 * @param loadBalancerId - ID of load balancer for which to delete certificates.
 * @param certificateId - ID of certificate for which to remove.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLoadBalancerCertificate = (
  loadBalancerId: number,
  certificateId: number
) => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`/aglb/${loadBalancerId}/certificates/${certificateId}`),
    makeResponse()
  );
};

/**
 * Intercepts GET request to retrieve AGLB service targets and mocks HTTP 500 error response.
 *
 * @param loadBalancerId - ID of load balancer for which to delete certificates.
 * @param certificateId - ID of certificate for which to remove.
 * @param message - Optional error message with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLoadBalancerCertificateError = (
  loadBalancerId: number,
  certificateId: number,
  message?: string
) => {
  const defaultMessage =
    'An error occurred while deleting Load Balancer certificate.';
  return cy.intercept(
    'DELETE',
    apiMatcher(`/aglb/${loadBalancerId}/certificates/${certificateId}`),
    makeErrorResponse(message ?? defaultMessage, 500)
  );
};

/**
 * Intercepts PUT request to update an AGLB load balancer certificate and mocks a success response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock certificates.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateLoadBalancerCertificate = (
  loadBalancerId: number,
  certificate: Certificate
) => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/aglb/${loadBalancerId}/certificates/${certificate.id}`),
    makeResponse(certificate)
  );
};

/**
 * Intercepts GET request to retrieve AGLB service targets and mocks response.
 *
 * @param serviceTargets - Service targets with which to mock response.
 *
 * @returns Cypress chainable.
 */
// TODO: AGLB - We should probably remove this mock and use "mockGetLoadBalancerServiceTargets" below.
export const mockGetServiceTargets = (
  loadBalancer: Loadbalancer,
  serviceTargets: ServiceTarget[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancer.id}/service-targets*`),
    paginateResponse(serviceTargets)
  );
};

/**
 * Intercepts GET request to retrieve AGLB service targets and mocks HTTP 500 error response.
 *
 * @param message - Optional error message with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetServiceTargetsError = (message?: string) => {
  const defaultMessage = 'An error occurred while retrieving service targets';
  return cy.intercept(
    'GET',
    apiMatcher('/aglb/service-targets*'),
    makeErrorResponse(message ?? defaultMessage, 500)
  );
};

/**
 * Intercepts POST request to create a service target and mocks response.
 *
 * @param loadBalancer - Load balancer for mocked service target.
 * @param serviceTarget - Service target with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateServiceTarget = (
  loadBalancer: Loadbalancer,
  serviceTarget: ServiceTarget
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`/aglb/${loadBalancer.id}/service-targets`),
    makeResponse(serviceTarget)
  );
};

/**
 * Intercepts PUT request to update a service target and mocks the response.
 *
 * @param loadBalancer - Load balancer for mocked route.
 * @param serviceTarget - Service target with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateServiceTarget = (
  loadBalancer: Loadbalancer,
  serviceTarget: ServiceTarget
) => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/aglb/${loadBalancer.id}/service-targets/${serviceTarget.id}`),
    makeResponse(serviceTarget)
  );
};

/**
 * Intercepts POST request to create a route and mocks response.
 *
 * @param loadBalancer - Load balancer for mocked route.
 * @param route - Route with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateRoute = (loadBalancer: Loadbalancer, route: Route) => {
  return cy.intercept(
    'POST',
    apiMatcher(`/aglb/${loadBalancer.id}/routes`),
    makeResponse(route)
  );
};

/**
 * Intercepts GET requests to retrieve AGLB load balancer routes and mocks response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock certificates.
 * @param routes - Load balancer routes with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancerRoutes = (
  loadBalancerId: number,
  routes: Route[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancerId}/routes*`),
    paginateResponse(routes)
  );
};

/**
 * Intercepts GET requests to retrieve AGLB load balancer service targets and mocks response.
 *
 * @param loadBalancerId - ID of load balancer for which to mock certificates.
 * @param serviceTargets - Load balancer service targets with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLoadBalancerServiceTargets = (
  loadBalancerId: number,
  serviceTargets: ServiceTarget[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher(`/aglb/${loadBalancerId}/service-targets*`),
    paginateResponse(serviceTargets)
  );
};

/**
 * Intercepts PUT request to update a route and mocks the response.
 *
 * @param loadBalancer - Load balancer for mocked route.
 * @param route - Route with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateRoute = (loadBalancer: Loadbalancer, route: Route) => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/aglb/${loadBalancer.id}/routes/${route.id}`),
    makeResponse(route)
  );
};

/**
 * Intercepts PUT request to update a route and mocks the response.
 *
 * @param loadBalancer - Load balancer for mocked route.
 * @param route - Route with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateRouteError = (
  loadBalancer: Loadbalancer,
  route: Route
) => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/aglb/${loadBalancer.id}/routes/${route.id}`),
    makeResponse(
      {
        errors: [
          {
            field: 'rules[3].match_condition.match_value',
            reason: 'Bad Match Value',
          },
          {
            field: 'rules[3].match_condition.match_field',
            reason: 'Bad Match Type',
          },
          {
            field: 'rules[3].service_targets[0].id',
            reason: 'Service Target does not exist',
          },
          {
            field: 'rules[3].service_targets[0].percentage',
            reason: 'Invalid percentage',
          },
          {
            field: 'rules[3].service_targets[0].percentage',
            reason: 'Invalid percentage',
          },
          {
            field: 'rules[3].match_condition.session_stickiness_ttl',
            reason: 'Invalid TTL',
          },
          {
            field: 'rules[3].match_condition.session_stickiness_cookie',
            reason: 'Invalid Cookie',
          },
          {
            field: 'rules[3].match_condition.hostname',
            reason: 'Hostname is not valid',
          },
          {
            reason: 'A backend service is down',
          },
          {
            reason: 'You reached a rate limit',
          },
        ],
      },
      400
    )
  );
};
