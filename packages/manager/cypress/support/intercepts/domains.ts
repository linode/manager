/**
 * @file Cypress intercepts and mocks for Domain API requests.
 */

import type { Domain } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts POST request to create a Domain.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateDomain = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('domains'));
};

/**
 * Intercepts GET request to mock domain data.
 *
 * @param domains - an array of mock domain objects
 *
 * @returns Cypress chainable.
 */
export const mockGetDomains = (domains: Domain[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('domains*'), paginateResponse(domains));
};

/**
 * Intercepts POST request to create a Domain record.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateDomainRecord = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('domains/*/record*'));
};
