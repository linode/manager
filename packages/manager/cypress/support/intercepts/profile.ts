/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
 */

import { makeResponse } from 'support/util/response';
import { paginateResponse } from 'support/util/paginate';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import type {
  Profile,
  UserPreferences,
  SecurityQuestionsData,
  SecurityQuestionsPayload,
  Token,
} from '@linode/api-v4/types';

/**
 * Intercepts GET request to fetch user profile.
 *
 * @returns Cypress chainable.
 */
export const interceptGetProfile = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('profile'));
};

/**
 * Intercepts GET request to fetch user profile and mocks response.
 *
 * @param profile - Profile with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetProfile = (profile: Profile): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('profile'), profile);
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
  return cy.intercept('GET', apiMatcher('profile/preferences'), preferences);
};

/**
 * Intercepts POST request to opt out of SMS verification and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockSmsVerificationOptOut = (): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher('profile/phone-number'), {});
};

/**
 * Intercepts POST request to send SMS verification code and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockSendVerificationCode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('profile/phone-number'), {});
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
  return cy.intercept(
    'POST',
    apiMatcher('profile/phone-number/verify'),
    response
  );
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
    apiMatcher('profile/security-questions'),
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
    apiMatcher('profile/security-questions'),
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
  return cy.intercept('POST', apiMatcher('profile/tfa-enable'), {
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
  return cy.intercept('POST', apiMatcher('profile/tfa-disable'), {});
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
  return cy.intercept('POST', apiMatcher('profile/tfa-enable-confirm'), {
    scratch: scratchCode,
  });
};

/**
 * Intercepts GET request to retrieve third party app tokens and mocks response.
 *
 * @param tokens - Array of third party app tokens with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetAppTokens = (tokens: Token[]): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('profile/apps*'),
    paginateResponse(tokens)
  );
};

/**
 * Intercepts GET request to retrieve personal access tokens and mocks response.
 *
 * @param tokens - Array of personal access tokens with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetPersonalAccessTokens = (
  tokens: Token[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('profile/tokens*'),
    paginateResponse(tokens)
  );
};

/**
 * Intercepts POST request to create a personal access token and mocks response.
 *
 * @param token - Personal access token with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockCreatePersonalAccessToken = (
  token: Token
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('profile/tokens'),
    makeResponse(token)
  );
};

/**
 * Intercepts PUT request to update a personal access token and mocks response.
 *
 * @param id - ID of token for intercepted update request.
 * @param updatedToken - Token data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdatePersonalAccessToken = (
  id: number,
  updatedToken: Token
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`profile/tokens/${id}`),
    makeResponse(updatedToken)
  );
};

/**
 * Intercepts DELETE request to revoke a personal access token and mocks response.
 *
 * @param id - ID of token for intercepted revoke request.
 *
 * @returns Cypress chainable.
 */
export const mockRevokePersonalAccessToken = (
  id: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`profile/tokens/${id}`),
    makeResponse({})
  );
};
