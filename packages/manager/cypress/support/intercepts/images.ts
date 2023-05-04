/**
 * @file Cypress intercepts and mocks for Image API requests.
 */

import type { Image, ImageStatus } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { imageFactory } from '@src/factories';

/**
 * Intercepts POST request to create a Image.
 *
 * @param image - an image objects
 *
 * @returns Cypress chainable.
 */
export const interceptCreateImage = (image: Image): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('images'), image);
};

/**
 * Intercepts GET request to mock image data.
 *
 * @param images - an array of mock image objects
 *
 * @returns Cypress chainable.
 */
export const mockGetImages = (images: Image[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('images*'), paginateResponse(images));
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
  return cy.intercept('GET', apiMatcher(`images/${id}*`), (req) => {
    return req.reply(
      imageFactory.build({
        label,
        id,
        status,
      })
    );
  });
};
