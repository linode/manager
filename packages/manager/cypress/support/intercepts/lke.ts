/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */

import type { KubernetesCluster } from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { makeResponse } from 'support/util/response';

/**
 * Intercepts POST request to create an LKE cluster.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateCluster = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('lke/clusters'));
};

/**
 * Intercepts POST request to create an LKE cluster and mocks the response.
 *
 * @param cluster - LKE cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateCluster = (
  cluster: KubernetesCluster
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('lke/clusters'),
    makeResponse(cluster)
  );
};
