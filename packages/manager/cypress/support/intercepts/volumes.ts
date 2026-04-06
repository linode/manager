/**
 * @files Cypress intercepts and mocks for Volume API requests.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { PriceType, Volume } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch Volumes and mocks response.
 *
 * @param volumes - Array of Volumes with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVolumes = (volumes: Volume[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('volumes*'), paginateResponse(volumes));
};

/**
 * Intercepts GET request to fetch a Volume and mocks response.
 *
 * @param volume - Volume with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVolume = (volume: Volume): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`volumes/${volume.id}`),
    makeResponse(volume)
  );
};

/**
 * Intercepts POST request to create a Volume.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateVolume = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('volumes'));
};

/**
 * Intercepts POST request to create a Volume and mocks response.
 *
 * @param volume - Volume with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateVolume = (volume: Volume): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('volumes'), volume);
};

/**
 * Intercepts POST request to attach a Volume to a Linode.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptAttachVolume = (
  volumeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/${volumeId}/attach`));
};

/**
 * Intercepts POST request to detach a Volume from a Linode.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptDetachVolume = (
  volumeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/${volumeId}/detach`));
};

/**
 * Intercepts POST request to detach a Volume from a Linode and mocks response.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const mockDetachVolume = (volumeId: number): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/${volumeId}/detach`), {});
};

/**
 * Intercepts a POST request to clone a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptCloneVolume = (
  volumeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/${volumeId}/clone`));
};

/**
 * Intercepts POST request to resize a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptResizeVolume = (
  volumeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/${volumeId}/resize`));
};

/**
 * Intercepts POST request to delete a Volume.
 *
 * @param volumeId - ID of Volume for intercepted request.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteVolume = (
  volumeId: number
): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`volumes/${volumeId}`));
};

/**
 * Intercepts POST request to migrate volumes and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockMigrateVolumes = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher(`volumes/migrate`), {});
};

/**
 * Intercepts GET request to fetch Volumes Types and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVolumeTypes = (
  volumeTypes: PriceType[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('volumes/types*'),
    paginateResponse(volumeTypes)
  );
};

/**
 * Intercepts GET request to fetch Volumes Types and mocks an error response.
 *
 * @returns Cypress chainable.
 */
export const mockGetVolumeTypesError = (): Cypress.Chainable<null> => {
  const errorResponse = makeErrorResponse('', 500);

  return cy.intercept(
    'GET',
    apiMatcher('volumes/types*'),
    makeResponse(errorResponse)
  );
};
