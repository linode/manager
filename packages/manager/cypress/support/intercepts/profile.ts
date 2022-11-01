/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
 */

import { makeErrorResponse } from 'support/util/errors';
import type {
  Profile,
  UserPreferences,
  SecurityQuestionsData,
  SecurityQuestionsPayload,
} from '@linode/api-v4/types';

/**
 * Intercepts GET request to fetch user profile.
 *
 * @returns Cypress chainable.
 */
export const interceptGetProfile = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/profile');
};

/**
 * Intercepts GET request to fetch user profile and mocks response.
 *
 * @param profile - Profile with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetProfile = (profile: Profile): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/profile', profile);
};

/**
 * Intercepts GET request to fetch user preferences and mocks response.
 *
 * @param preferences - User preferences with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetUserPreferences = (
  preferences: UserPreferences
): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/profile/preferences', preferences);
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
 *
 * @returns Cypress chainable.
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

/**
 * Intercepts GET request to fetch security question data and mocks response.
 *
 * @param securityQuestionsData - Security questions response data.
 *
 * @returns Cypress chainable.
 */
export const mockGetSecurityQuestions = (
  securityQuestionsData: SecurityQuestionsData
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    '*/profile/security-questions',
    securityQuestionsData
  );
};

/**
 * Intercepts POST request to update security questions and mocks response.
 *
 * @param securityQuestionsPayload - Security questions response data.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateSecurityQuestions = (
  securityQuestionsPayload: SecurityQuestionsPayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    '*/profile/security-questions',
    securityQuestionsPayload
  );
};

/**
 * Intercepts POST request to enable 2FA and mocks the response.
 *
 * @param secretString - Secret 2FA key to include in mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockEnableTwoFactorAuth = (
  secretString: string
): Cypress.Chainable<null> => {
  // TODO Create an expiration date based on the current time.
  const expiry = '2025-05-01T03:59:59';
  return cy.intercept('POST', '*/profile/tfa-enable', {
    secret: secretString,
    expiry,
  });
};

/**
 * Intercepts POST request to disable two factor authentication and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockDisableTwoFactorAuth = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/profile/tfa-disable', {});
};

/**
 * Intercepts POST request to confirm two factor authentication and mocks response.
 *
 * @param scratchCode - Mocked 2FA scratch code.
 *
 * @returns Cypress chainable.
 */
export const mockConfirmTwoFactorAuth = (
  scratchCode: string
): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/profile/tfa-enable-confirm', {
    scratch: scratchCode,
  });
};
