/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
 */

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

/**
 * Intercepts POST request to opt out of SMS verification and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockSmsVerificationOptOut = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/account/phone-number/opt-out', {});
};
