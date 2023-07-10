/**
 * @files Cypress intercepts and mocks for Firewall API requests.
 */

import { apiMatcher } from 'support/util/intercepts';

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
