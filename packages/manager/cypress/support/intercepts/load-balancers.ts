import { paginateResponse } from 'support/util/paginate';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import type { ServiceTarget } from '@linode/api-v4';

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
