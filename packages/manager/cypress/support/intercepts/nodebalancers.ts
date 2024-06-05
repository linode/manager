/**
 * @file Cypress intercepts and mocks for NodeBalancer API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { NodeBalancer } from '@linode/api-v4';

/**
 * Intercepts GET request to mock nodeBalancer data.
 *
 * @param nodeBalancers - an array of mock nodeBalancer objects
 *
 * @returns Cypress chainable.
 */
export const mockGetNodeBalancers = (
  nodeBalancers: NodeBalancer[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('nodebalancers*'),
    paginateResponse(nodeBalancers)
  );
};

/**
 * Intercepts POST request to intercept nodeBalancer data.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateNodeBalancer = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('nodebalancers'));
};
