/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import type { Linode, Volume } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts POST request to create a Linode.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('linode/instances'));
};

/**
 * Intercepts GET request to mock linode data.
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
