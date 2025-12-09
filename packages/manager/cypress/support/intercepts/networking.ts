import { apiMatcher } from 'support/util/intercepts';

/**
 * Mocks PUT request to update an IP address.
 *
 * @param address - the IP address to update
 * @param rdns - the updated RDNS of the IP address
 *
 * @returns Cypress chainable.
 */
export const mockUpdateIPAddress = (
  address: string,
  rdns: string
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher(`/networking/ips/${address}`), rdns);
};
