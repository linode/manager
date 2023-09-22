/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { Disk, Linode, LinodeType, Volume } from '@linode/api-v4/types';

/**
 * Intercepts POST request to create a Linode.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('linode/instances'));
};

/**
 * Intercepts GET request to get all Linodes.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodes = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('linode/instances/*'));
};

/**
 * Intercepts GET request to get all Linodes and mocks the response.
 *
 * @param linodes - an array of mock linode objects
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodes = (linodes: Linode[]): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/instances/*'),
    paginateResponse(linodes)
  );
};

/**
 * Intercepts GET request to retrieve Linode details.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLinodeDetails = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`linode/instances/${linodeId}*`));
};

/**
 * Intercepts GET request to retrieve Linode configs.
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
 * Intercepts Clone Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptCloneLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`linode/instances/${linodeId}/clone`));
};

/**
 * Intercepts GET request to retrieve Linode details and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param linode - Linode data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeDetails = (
  linodeId: number,
  linode: Linode
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}*`),
    linode
  );
};

/**
 * Intercepts GET request to retrieve a Linode's Volumes and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param volumes - Array of Volumes with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeVolumes = (
  linodeId: number,
  volumes: Volume[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/volumes*`),
    paginateResponse(volumes)
  );
};

/**
 * Intercepts POST request to reboot a Linode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptRebootLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/reboot`)
  );
};

/**
 * Intercepts POST request to reboot a Linode into rescue mode.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptRebootLinodeIntoRescueMode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/rescue`)
  );
};

/**
 * Intercepts GET request to retrieve a Linode's Disks and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 * @param disks - Array of Disks with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeDisks = (
  linodeId: number,
  disks: Disk[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/instances/${linodeId}/disks*`),
    paginateResponse(disks)
  );
};

/**
 * Intercepts DELETE request to delete linode and mocks response.
 *
 * @param linodeId - ID of Linode for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteLinodes = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`linode/instances/${linodeId}`),
    makeResponse({})
  );
};

/**
 * Intercepts GET request to fetch Linode types and mocks the response.
 *
 * @param types - Linode types with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeTypes = (
  types: LinodeType[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('linode/types*'),
    paginateResponse(types)
  );
};

/**
 * Intercepts GET request to fetch a Linode type and mocks the response.
 *
 * @param type - Linode type with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodeType = (
  type: LinodeType
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`linode/types/${type.id}`),
    makeResponse(type)
  );
};

/**
 * Intercepts POST request to migrate a Linode.
 *
 * @param linodeId - ID of Linode being cloned.
 *
 * @returns Cypress chainable.
 */
export const mockMigrateLinode = (
  linodeId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`linode/instances/${linodeId}/migrate`),
    {
      statusCode: 200,
    }
  );
};
