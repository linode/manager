/**
 * @file Cypress intercepts and mocks for Cloud Manager StackScript operations.
 */

import type { StackScript } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

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
 * Intercepts GET request to mock a StackScript.
 *
 * @param id - StackScript instance identifier
 * @param stackscript - a mock StackScript object
 *
 * @returns Cypress chainable.
 */
export const mockGetStackScript = (
  id: number,
  stackscript: StackScript
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/stackscripts/${id}`),
    stackscript
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

/**
 * Mock DELETE request to remove a StackScript.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteStackScript = (id: number): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`linode/stackscripts/${id}`), {
    statusCode: 200,
    body: {},
  });
};

/**
 * Intercept PUT request to update a StackScript.
 *
 * @param id - StackScript instance identifier
 * @param stackscript - a mock StackScript object
 *
 * @returns Cypress chainable.
 */
export const mockUpdateStackScript = (
  id: number,
  stackscript: StackScript
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`linode/stackscripts/${id}`),
    makeResponse(stackscript)
  );
};

/**
 * Intercept PUT request to mock StackScript update error.
 *
 * @param id - StackScript instance identifier
 * @param err_message - the error message if is_err is true
 *
 * @returns Cypress chainable.
 */
export const mockUpdateStackScriptError = (
  id: number,
  err_field: string | null = null,
  err_message: string | null = null
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`linode/stackscripts/${id}`),
    makeResponse(
      {
        errors: [
          {
            reason: err_message,
            field: err_field,
          },
        ],
      },
      400
    )
  );
};
