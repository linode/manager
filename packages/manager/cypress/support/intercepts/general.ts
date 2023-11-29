import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts all Linode APIv4 requests and mocks maintenance mode response.
 *
 * Maintenance mode mock is achieved by inserting the `x-maintenace-mode` header
 * into the intercepted response.
 *
 * @returns Cypress chainable.
 */
export const mockApiMaintenanceMode = () => {
  const errorResponse = makeErrorResponse(
    'Currently in maintenance mode.',
    503
  );
  errorResponse.headers = {
    'x-maintenance-mode': 'all,All endpoints are temporarily unavailable.',
  };

  return cy.intercept(apiMatcher('**'), errorResponse);
};
