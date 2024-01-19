/**
 * @files Cypress intercepts and mocks for Volume API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { Volume } from '@linode/api-v4';

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
