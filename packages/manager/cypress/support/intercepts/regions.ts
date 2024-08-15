/**
 * @file Cypress intercept and mock utilities for Linode regions.
 */

import { Region, RegionAvailability } from '@linode/api-v4';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import {
  isExtendedRegion,
  getRegionFromExtendedRegion,
} from 'support/util/regions';

import type { ExtendedRegion } from 'support/util/regions';

/**
 * Intercepts GET request to fetch Linode regions and mocks response.
 *
 * The array of mock regions can contain actual API region objects, or Cypress-
 * specific `ExtendedRegion` instances. If `ExtendedRegion` instances are passed,
 * they will be mocked as regular `Region` objects.
 *
 * @param regions - Regions with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetRegions = (
  regions: Region[] | ExtendedRegion[]
): Cypress.Chainable<null> => {
  const mockResponseRegions = regions.map(
    (region: Region | ExtendedRegion): Region => {
      if (isExtendedRegion(region)) {
        return getRegionFromExtendedRegion(region);
      }
      return region;
    }
  );

  return cy.intercept(
    'GET',
    apiMatcher('regions*'),
    paginateResponse(mockResponseRegions)
  );
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
