import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { PlacementGroup } from '@linode/api-v4';
import { makeResponse } from 'support/util/response';

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
    paginateResponse(placementGroups)
  );
};

/**
 * Intercepts GET request to fetch a Placement Group and mocks response.
 *
 * @param placementGroup - Placement Group to intercept and mock.
 *
 * @returns Cypress chainable.
 */
export const mockGetPlacementGroup = (
  placementGroup: PlacementGroup
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`placement/groups/${placementGroup.id}`),
    makeResponse(placementGroup)
  );
};

/**
 * Intercepts DELETE request to delete Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept delete request.
 *
 * @returns Cypress chainable.
 */
export const mockDeletePlacementGroup = (
  placementGroupId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`placement/groups/${placementGroupId}`),
    makeResponse({})
  );
};

/**
 * Intercepts POST request to unassign Linode from Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept unassign request.
 * @param placementGroup - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUnassignPlacementGroupLinodes = (
  placementGroupId: number,
  placementGroup: PlacementGroup
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`placement/groups/${placementGroupId}/unassign`),
    makeResponse(placementGroup)
  );
};
