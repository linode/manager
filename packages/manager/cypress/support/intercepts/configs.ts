/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { Config, Interface } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch all configs for a given linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodeConfigs = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/configs*`)
  );
};

/**
 * Intercepts POST request to create a linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinodeConfigs = (
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
export const interceptUpdateLinodeConfigs = (
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

/**
 * Mocks DELETE request to delete an interface of linode config.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param configId - ID of Linode config for intercepted request.
 * @param interfaceId - ID of Interface in the Linode config.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLinodeConfigInterface = (
  linodeId: number,
  configId: number,
  interfaceId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(
      `linode/instances/${linodeId}/configs/${configId}/interfaces/${interfaceId}`
    ),
    makeResponse()
  );
};

/**
 * Mocks GET request to retrieve Linode configs.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param configs - a list of Linode configs with which to mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeConfigs = (
  linodeId: number,
  configs: Config[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/configs*`),
    paginateResponse(configs)
  );
};

/**
 * Mocks GET request to retrieve a Linode Config
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param config - the config with which to mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeConfig = (
  linodeId: number,
  config: Config
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/configs/${config.id}`),
    config
  );
};

/**
 * Mocks GET request to retrieve an interface of a Linode config
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param configId - ID of Config for mocked request.
 * @param configInterface - The interface with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeConfigInterface = (
  linodeId: number,
  configId: number,
  configInterface: Interface
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(
      `linode/instances/${linodeId}/configs/${configId}/interfaces/${configInterface.id}`
    ),
    configInterface
  );
};

/**
 * Mocks PUT request to update a linode config.
 *
 * @param linodeId - ID of Linode for mock request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateLinodeConfigs = (
  linodeId: number,
  config: Config
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`linode/instances/${linodeId}/configs/${config.id}`),
    config
  );
};

/**
 * Mocks POST request to create a Linode config.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLinodeConfigs = (
  linodeId: number,
  config: Config
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/configs`),
    config
  );
};

/**
 * Mocks POST request to retrieve interfaces from a given Linode config.
 *
 * @param linodeId - ID of Linode for mocked request.
 * @param config - config data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLinodeConfigInterfaces = (
  linodeId: number,
  config: Config
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/configs/${config.id}/interfaces`),
    config.interfaces ?? undefined
  );
};
