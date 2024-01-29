/**
 * @file Cypress intercepts and mocks for Image API requests.
 */

import { imageFactory } from '@src/factories';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { getFilters } from 'support/util/request';

import type { Image, ImageStatus } from '@linode/api-v4';

/**
 * Intercepts POST request to create a machine image and mocks the response.
 *
 * @param image - an image objects
 *
 * @returns Cypress chainable.
 */
export const mockCreateImage = (image: Image): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('images'), image);
};

/**
 * Intercepts POST request to upload a machine image.
 *
 * @returns Cypress chainable.
 */
export const interceptUploadImage = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('images/upload'));
};

/**
 * Intercepts GET request to retrieve all images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAllImages = (images: Image[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('images*'), paginateResponse(images));
};

/**
 * Intercepts GET request to retrieve custom images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetCustomImages = (
  images: Image[]
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('images*'), (req) => {
    const filters = getFilters(req);
    if (filters?.type === 'manual') {
      req.reply(paginateResponse(images));
      return;
    }
    req.continue();
  });
};

/**
 * Intercepts GET request to retrieve custom images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetRecoveryImages = (
  images: Image[]
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('images*'), (req) => {
    const filters = getFilters(req);
    if (filters?.type === 'automatic') {
      req.reply(paginateResponse(images));
      return;
    }
    req.continue();
  });
};

/**
 * Intercepts the response for an image GET request.
 *
 * Responds with an image with the given label, ID, and status.
 *
 * @param label - Response image label.
 * @param id - Response image ID. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param status - Image status.
 *
 * @returns Cypress chainable.
 */
export const mockGetImage = (
  label: string,
  id: string,
  status: ImageStatus
): Cypress.Chainable<null> => {
  const encodedId = encodeURIComponent(id);
  return cy.intercept('GET', apiMatcher(`images/${encodedId}*`), (req) => {
    return req.reply(
      imageFactory.build({
        id,
        label,
        status,
      })
    );
  });
};

/**
 * Intercepts PUT request to update an image and mocks the response.
 *
 * @param id - ID of image being updated.
 * @param updatedImage - Updated image with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateImage = (
  id: string,
  updatedImage: Image
): Cypress.Chainable<null> => {
  const encodedId = encodeURIComponent(id);
  return cy.intercept('PUT', apiMatcher(`images/${encodedId}`), updatedImage);
};

/**
 * Intercepts DELETE request to delete an image and mocks the response.
 *
 * @param id - ID of image being deleted.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteImage = (id: string): Cypress.Chainable<null> => {
  const encodedId = encodeURIComponent(id);
  return cy.intercept('DELETE', apiMatcher(`images/${encodedId}`), {});
};
