import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { MaintenancePolicy } from '@linode/api-v4';

/**
 * Intercepts request to retrieve maintenance policies and mocks the response.
 *
 * @param policies - Maintenance policies with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetMaintenancePolicies = (
  policies: MaintenancePolicy[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    apiMatcher('maintenance/policies*'),
    paginateResponse(policies)
  );
};
