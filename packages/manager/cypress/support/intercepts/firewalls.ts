/**
 * @file Cypress intercepts and mocks for Firewall API requests.
 */
import type { Firewall } from '@linode/api-v4';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts GET request to fetch Firewalls.
 *
 * @returns Cypress chainable.
 */
export const interceptGetFirewalls = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('networking/firewalls*'));
};

/**
 * Intercepts GET request to fetch Firewalls and mocks response.
 *
 * @param firewalls - Array of Firewalls with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetFirewalls = (
  firewalls: Firewall[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('networking/firewalls*'),
    paginateResponse(firewalls)
  );
};

/**
 * Intercepts POST request to create a Firewall.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateFirewall = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('networking/firewalls'));
};

/**
 * Intercepts PUT request to update a Firewall's rules.
 *
 * @returns Cypress chainable.
 */
export const interceptUpdateFirewallRules = (
  firewallId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`networking/firewalls/${firewallId}/rules`)
  );
};

/**
 * Intercepts POST request to update a Firewall's Linodes.
 *
 * @returns Cypress chainable.
 */
export const interceptUpdateFirewallLinodes = (
  firewallId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls/${firewallId}/devices`)
  );
};
