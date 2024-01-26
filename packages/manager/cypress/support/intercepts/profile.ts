/**
 * @file Cypress intercepts and mocks for Cloud Manager profile requests.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type {
  Grants,
  OAuthClient,
  Profile,
  SecurityQuestionsData,
  SecurityQuestionsPayload,
  Token,
  UserPreferences,
} from '@linode/api-v4';

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
 * Intercepts PUT request to update a profile and mocks response.
 *
 * @param profile - Updated Profile with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateProfile = (
  profile: Profile
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher('profile'), makeResponse(profile));
};

/**
 * Intercepts GET request to fetch profile grants and mocks response.
 *
 * @param grants - Grants object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetProfileGrants = (
  grants: Grants
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('profile/grants'),
    makeResponse(grants)
  );
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
 * Intercepts PUT request to update user preferences and mocks response.
 *
 * @param preferences - Updated user preferences with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateUserPreferences = (
  preferences: UserPreferences
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher('profile/preferences'), preferences);
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
    expiry,
    secret: secretString,
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
 * Intercepts DELETE request to revoke a third party app token and mocks response.
 *
 * @param id - ID of token for intercepted revoke request.
 *
 * @returns Cypress chainable.
 */
export const mockRevokeAppToken = (id: number): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`profile/apps/${id}`),
    makeResponse({})
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

/**
 * Intercepts POST request to create an oauth app and mocks response.
 *
 * @param oauthApp - oauth app with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockCreateOAuthApp = (
  oauthApp: OAuthClient
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('account/oauth-clients*'), oauthApp);
};

/**
 * Intercepts GET request to fetch oauth apps and mocks response.
 *
 * @param oauthApps - oauth apps with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetOAuthApps = (
  oauthApps: OAuthClient[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('account/oauth-clients*'),
    paginateResponse(oauthApps)
  );
};

/**
 * Intercepts DELETE request to delete an oauth app.
 *
 * @param oauthApp - An oauth app with which to reset.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteOAuthApps = (appId: string): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`account/oauth-clients/${appId}`),
    makeResponse({})
  );
};

/**
 * Intercepts PUT request to update an oauth and mocks response.
 *
 * @param oauthApp - An OAuth App with which to update.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateOAuthApps = (
  appId: string,
  oauthApp: OAuthClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`account/oauth-clients/${appId}`),
    oauthApp
  );
};

/**
 * Intercepts POST request to fetch oauth apps and mocks response.
 *
 * @param oauthApp - An OAuth App with which to reset.
 *
 * @returns Cypress chainable.
 */
export const mockResetOAuthApps = (
  appId: string,
  oauthApp: OAuthClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`account/oauth-clients/${appId}/reset-secret`),
    oauthApp
  );
};
