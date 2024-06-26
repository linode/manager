import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

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
 * Intercept POST request to create a Placement Group and mocks response.
 *
 * @param placementGroup - Placement group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreatePlacementGroup = (
  placementGroup: PlacementGroup
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('placement/groups'),
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
 * Intercepts POST request to assign Linodes to Placement Group and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept assign request.
 * @param placementGroup - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockAssignPlacementGroupLinodes = (
  placementGroupId: number,
  placementGroup: PlacementGroup
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`placement/groups/${placementGroupId}/assign`),
    makeResponse(placementGroup)
  );
};

/**
 * Intercepts POST request to assign Linodes to Placement Group and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
export const mockAssignPlacementGroupLinodesError = (
  placementGroupId: number,
  errorMessage: string = 'An error has occurred',
  errorCode: number = 500
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`placement/groups/${placementGroupId}/assign`),
    makeErrorResponse(errorMessage, errorCode)
  );
};

/**
 * Intercepts POST request to unassign Linodes from Placement Group and mocks response.
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

/**
 * Intercepts POST request to unassign Linodes from Placement Groups and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
export const mockUnassignPlacementGroupLinodesError = (
  placementGroupId: number,
  errorMessage: string = 'An error has occurred',
  errorCode: number = 500
) => {
  return cy.intercept(
    'POST',
    apiMatcher(`placement/groups/${placementGroupId}/unassign`),
    makeErrorResponse(errorMessage, errorCode)
  );
};

/**
 * Intercepts POST request to delete a Placement Group and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
export const mockDeletePlacementGroupError = (
  placementGroupId: number,
  errorMessage: string = 'An error has occurred',
  errorCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`placement/groups/${placementGroupId}`),
    makeErrorResponse(errorMessage, errorCode)
  );
};

/**
 * Intercepts PUT request to update Placement Group label and mocks response.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept update label request.
 * @param placementGroupData - Placement Group object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdatePlacementGroup = (
  placementGroupId: number,
  placementGroupData: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`placement/groups/${placementGroupId}`),
    makeResponse(placementGroupData)
  );
};

/**
 * Intercepts PUT request to update Placement Group label and mocks HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param placementGroupId - ID of Placement Group for which to intercept update label request.
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
export const mockUpdatePlacementGroupError = (
  placementGroupId: number,
  errorMessage: string = 'An error has occurred',
  errorCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`placement/groups/${placementGroupId}`),
    makeErrorResponse(errorMessage, errorCode)
  );
};
