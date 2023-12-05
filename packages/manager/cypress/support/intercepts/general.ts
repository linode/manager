import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { makeResponse } from 'support/util/response';

/**
 * Intercepts GET request to given URL and mocks an HTTP 200 response with the given content.
 *
 * This can be used to mock visits to arbitrary webpages.
 *
 * @param url - Webpage URL for which to intercept GET request.
 * @param content - Webpage content with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockWebpageUrl = (
  url: string,
  content: string
): Cypress.Chainable<null> => {
  return cy.intercept(url, makeResponse(content, 200));
};

/**
 * Intercepts all Linode APIv4 requests and mocks maintenance mode response.
 *
 * Maintenance mode mock is achieved by inserting the `x-maintenace-mode` header
 * into the intercepted response.
 *
 * @returns Cypress chainable.
 */
export const mockApiMaintenanceMode = (): Cypress.Chainable<null> => {
  const errorResponse = makeErrorResponse(
    'Currently in maintenance mode.',
    503
  );
  errorResponse.headers = {
    'x-maintenance-mode': 'all,All endpoints are temporarily unavailable.',
  };

  return cy.intercept(apiMatcher('**'), errorResponse);
};
