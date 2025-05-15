/**
 * @file Cypress intercepts and mocks for Image API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { getFilters } from 'support/util/request';
import { makeResponse } from 'support/util/response';

import type { Image } from '@linode/api-v4';

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
 * Intercepts GET request to retrieve all images.
 *
 * @returns Cypress chainable.
 */
export const interceptGetAllImages = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('images*'));
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
    }
  });
};

/**
 * Intercepts GET request to retrieve recovery images and mocks response.
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
    }
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
  imageId: string,
  image: Image
): Cypress.Chainable<null> => {
  const encodedId = encodeURIComponent(imageId);
  return cy.intercept(
    'GET',
    apiMatcher(`images/${encodedId}*`),
    makeResponse(image)
  );
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

/**
 * Intercepts POST request to update an image's regions and mocks the response.
 *
 * @param id - ID of image
 * @param updatedImage - Updated image with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateImageRegions = (
  id: string,
  updatedImage: Image
): Cypress.Chainable<null> => {
  const encodedId = encodeURIComponent(id);
  return cy.intercept(
    'POST',
    apiMatcher(`images/${encodedId}/regions`),
    updatedImage
  );
};
