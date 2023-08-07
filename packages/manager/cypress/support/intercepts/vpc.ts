/**
 * @files Cypress intercepts and mocks for VPC API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { VPC } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch VPCs and mocks response.
 *
 * @param vpcs - Array of VPCs with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVPCs = (vpcs: VPC[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('vpcs*'), paginateResponse(vpcs));
};
