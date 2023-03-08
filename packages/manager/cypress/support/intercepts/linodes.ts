/**
 * @file Cypress intercepts and mocks for Cloud Manager Linode operations.
 */

import { Linode } from '@linode/api-v4/types';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { apiMatcher } from 'support/util/intercepts';

/**
 * Intercepts POST request to create a Linode.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateLinode = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('linode/instances'));
};

/**
 * Intercepts GET request to mock linode data.
 *
 * @param linodes - an array of mock linode objects
 *
 * @returns Cypress chainable.
 */
export const mockGetLinodes = (linodes: Linode[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('linode/instances/*'), (req) => {
    req.reply(makeResourcePage(linodes));
  });
};
