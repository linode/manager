/**
 * @file Mocks and intercepts related to notification and event handling.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { Beta, Event, Notification } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch events and mocks response.
 *
 * @param events - Array of Events with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetBetas = (betas: Beta[]): Cypress.Chainable => {
  return cy.intercept('GET', apiMatcher('betas'), makeResponse(betas));
};


