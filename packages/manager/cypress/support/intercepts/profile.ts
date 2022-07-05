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

/**
 * Intercepts POST request to opt out of SMS verification and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockSmsVerificationOptOut = (): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', '*/profile/phone-number', {});
};

/**
 * Intercepts POST request to send SMS verification code and mocks response.
 */
export const mockSendVerificationCode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/profile/phone-number', {});
};

/**
 * Intercepts POST request to verify SMS verification code and mocks response.
 *
 * If an `errorMessage` is provided, the mocked response will indicate an error.
 * Otherwise, a successful response is mocked.
 *
 * @param errorMessage - If specified, mocks an error response with the given message.
 *
 * @returns Cypress chainable.
 */
export const mockVerifyVerificationCode = (
  errorMessage?: string | undefined
): Cypress.Chainable<null> => {
  const response = !!errorMessage ? makeErrorResponse(errorMessage) : {};
  return cy.intercept('POST', '*/profile/phone-number/verify', response);
};
