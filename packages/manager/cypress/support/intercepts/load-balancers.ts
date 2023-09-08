import { paginateResponse } from 'support/util/paginate';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import type {
  ServiceTarget,
  Loadbalancer,
  Configuration,
  Certificate,
} from '@linode/api-v4';
import { makeResponse } from 'support/util/response';

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
 * Intercepts GET request to retrieve AGLB service targets and mocks response.
 *
 * @param serviceTargets - Service targets with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetServiceTargets = (serviceTargets: ServiceTarget[]) => {
  return cy.intercept(
    'GET',
    apiMatcher('/aglb/service-targets*'),
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
