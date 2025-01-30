/**
 * @file Cypress intercepts and mocks for NodeBalancer API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { Firewall, NodeBalancer } from '@linode/api-v4';

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
 * Intercepts GET request to mock a nodeBalancer.
 *
 * @param nodeBalancer - an mock nodeBalancer object
 *
 * @returns Cypress chainable.
 */
export const mockGetNodeBalancer = (
  nodeBalancer: NodeBalancer
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`nodebalancers/${nodeBalancer.id}`),
    nodeBalancer
  );
};

/**
 * Mocks GET request to get a NodeBalancer's firewalls.
 *
 * @param nodeBalancerId - ID of the NodeBalancer to get firewalls associated with it.
 * @param firewalls - the firewalls with which to mock the response.
 *
 * @returns Cypress Chainable.
 */
export const mockGetNodeBalancerFirewalls = (
  nodeBalancerId: number,
  firewalls: Firewall[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`nodebalancers/${nodeBalancerId}/firewalls`),
    paginateResponse(firewalls)
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
