/**
 * @files Cypress intercepts and mocks for VLAN API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { VLAN } from '@linode/api-v4';
/**
 * Intercepts GET request to fetch VLANs and mocks response.
 *
 * @param vlans - Array of VLANs with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVLANs = (vlans: VLAN[]): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('networking/vlans*'),
    paginateResponse(vlans)
  );
};
