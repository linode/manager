/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts GET request to fetch all configs for a given linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodeConfigs = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/configs`)
  );
};

/**
 * Intercepts POST request to create a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptPostLinodeConfigs = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/configs`)
  );
};

/**
 * Intercepts PUT request to update a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptPutLinodeConfigs = (
  linodeId: number,
  configId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`linode/instances/${linodeId}/configs/${configId}`)
  );
};

/**
 * Intercepts DELETE request to delete a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteLinodeConfig = (
  linodeId: number,
  configId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`linode/instances/${linodeId}/configs/${configId}`)
  );
};
