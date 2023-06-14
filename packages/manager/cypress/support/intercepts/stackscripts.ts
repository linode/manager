/**
 * @file Cypress intercepts and mocks for Cloud Manager StackScript operations.
 */

import type { StackScript } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts GET request to list StackScripts.
 *
 * @returns Cypress chainable.
 */
export const interceptGetStackScripts = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('linode/stackscripts*'));
};

/**
 * Intercepts GET request to mock StackScript data.
 *
 * @param stackScripts - an array of mock StackScript objects
 *
 * @returns Cypress chainable.
 */
export const mockGetStackScripts = (
  stackScripts: StackScript[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/stackscripts*'),
    paginateResponse(stackScripts)
  );
};

/**
 * Intercepts POST request to create a StackScript.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateStackScript = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('linode/stackscripts'));
};
