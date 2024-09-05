import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts PUT request to update an IP address.
 *
 * @param address - the IP address to update
 *
 * @returns Cypress chainable.
 */
export const interceptUpdateIPAddress = (
  address: string
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher(`/networking/ips/${address}`));
};
