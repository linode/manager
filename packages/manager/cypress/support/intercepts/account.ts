/**
 * @file Cypress intercepts and mocks for Cloud Manager account requests.
 */

import type { AccountSettings } from '@linode/api-v4/types';

/**
 * Intercepts GET request to fetch account user information.
 *
 * @param username - Username of user whose info is being fetched.
 *
 * @returns Cypress chainable.
 */
export const interceptGetUser = (username: string): Cypress.Chainable<null> => {
  return cy.intercept('GET', `*/account/users/${username}`);
};

/**
 * Intercepts GET request to fetch account settings and mocks response.
 *
 * @param settings - Account settings mock data with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccountSettings = (
  settings: AccountSettings
): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/account/settings', settings);
};

/**
 * Intercepts PUT request to update account username and mocks response.
 *
 * @param oldUsername - The original username which will be changed.
 * @param newUsername - The new username for the account.
 * @param restricted - Whether or not the account is restricted.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateUsername = (
  oldUsername: string,
  newUsername: string,
  restricted: boolean = false
) => {
  return cy.intercept('PUT', `*/account/users/${oldUsername}`, {
    username: newUsername,
    email: 'mockEmail@example.com',
    restricted,
    ssh_keys: [],
    tfa_enabled: false,
    verified_phone_number: null,
  });
};
