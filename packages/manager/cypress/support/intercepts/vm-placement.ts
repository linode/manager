import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { PlacementGroup } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch Placement Groups and mocks response.
 *
 * @param placementGroups - Array of Placement Group objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetPlacementGroups = (
  placementGroups: PlacementGroup[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('placement/groups*'),
    paginateResponse([])
  );
};
