/**
 * @file Cypress intercepts and mocks for Firewall API requests.
 */
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { Firewall, FirewallTemplate } from '@linode/api-v4';

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
 * Intercepts POST request to create a Firewall and mocks response.
 *
 * @param firewall - A Firewall with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateFirewall = (
  firewall: Firewall
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('networking/firewalls*'), firewall);
};

/**
 * Intercepts POST request to create a Firewall and mocks an error response.
 *
 * @param errorMessage - Error message to be included in the mocked HTTP response.
 * @param statusCode - HTTP status code for mocked error response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
export const mockCreateFirewallError = (
  errorMessage: string,
  statusCode: number = 400
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`networking/firewalls*`),
    makeErrorResponse(errorMessage, statusCode)
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

/**
 * Intercepts GET request to fetch a Firewall template and mocks response.
 *
 * @param template - Template with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetTemplate = (
  template: FirewallTemplate
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('networking/firewalls/templates/*'),
    template
  );
};
