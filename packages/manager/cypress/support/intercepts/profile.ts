/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
 */

import { makeErrorResponse } from 'support/util/errors';
import { Profile } from '@linode/api-v4/lib/profile/types';

/**
 * Intercepts GET request to fetch profile and mocks response.
 *
 * @param profile - Profile with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetProfile = (profile: Profile): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/profile', profile);
};
