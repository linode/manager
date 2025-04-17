/**
 * @file Cypress intercept and mock utilities for Linode regions.
 */

import { Region, RegionAvailability } from '@linode/api-v4';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import {
  isExtendedRegion,
  getRegionFromExtendedRegion,
} from 'support/util/regions';
import { makeResponse } from 'support/util/response';

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
  regions: ExtendedRegion[] | Region[]
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
 * Intercepts GET request to fetch a region and mocks response.
 *
 * The mock region can contain an actual API region object, or a Cypress-specific
 * `ExtendedRegion` instance. If an `ExtendedRegion` is passed, it will be mocked
 * as a regular `Region`.
 *
 * @param region - Region for which to intercept request and mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetRegion = (
  region: ExtendedRegion | Region
): Cypress.Chainable<null> => {
  const mockRegion = isExtendedRegion(region)
    ? getRegionFromExtendedRegion(region)
    : region;

  return cy.intercept(
    'GET',
    apiMatcher(`regions/${mockRegion.id}`),
    makeResponse(mockRegion)
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

/**
 * Mocks an error response for the GET request to retrieve regions in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving regions
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetRegionsError = (
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('regions*'),
    makeErrorResponse(errorMessage, status)
  );
};
