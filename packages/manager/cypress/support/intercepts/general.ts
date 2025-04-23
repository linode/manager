import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { makeResponse } from 'support/util/response';

/**
 * Intercepts all requests to Linode API v4 and mocks an HTTP response.
 *
 * This is useful to apply a baseline mock on all Linode API v4 requests, e.g.
 * to prevent 401 responses. More fine-grained mocking can be set up with
 * subsequent calls to other mock utils.
 *
 * @param body - Body data with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockAllApiRequests = (
  body: any = {},
  statusCode: number = 200
) => {
  return cy.intercept(apiMatcher('**/*'), makeResponse(body, statusCode));
};

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

/**
 * Intercepts all requests to Linode API-v4 and mocks an error HTTP response.
 *
 * @param errorCode - HTTP status code to mock.
 * @param errorMessage - Response error message to mock.
 *
 * @returns Cypress chainable.
 */
export const mockApiRequestWithError = (
  errorCode: number,
  errorReason: string
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('*'), {
    statusCode: errorCode,
    body: {
      errors: [
        {
          reason: errorReason,
        },
      ],
    },
  });
};

/**
 * Intercepts all requests to Linode API-v4 and inserts internal user header.
 *
 * @returns Cypress chainable.
 */
export const mockApiInternalUser = (): Cypress.Chainable<null> => {
  return cy.intercept(
    {
      middleware: true,
      url: apiMatcher('**/*'),
    },
    (req) => {
      // Re-add internal-only header
      req.on('response', (res) => {
        res.headers['akamai-internal-account'] = '*';
      });
    }
  );
};
