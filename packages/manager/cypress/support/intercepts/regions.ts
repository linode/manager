/**
 * @file Cypress intercept and mock utilities for Linode regions.
 */

import { Region, RegionAvailability } from '@linode/api-v4';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

/**
 * Intercepts GET request to fetch Linode regions and mocks response.
 *
 * @param regions - Regions with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetRegions = (regions: Region[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('regions*'), paginateResponse(regions));
};

/**
 * Intercepts GET request to fetch regions availability and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockGetRegionAvailability = (
  regionId: Region['id'],
  regionAvailability: RegionAvailability[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`regions/${regionId}/availability`),
    regionAvailability
  );
};
