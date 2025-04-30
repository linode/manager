/**
 * @file Cypress intercepts and mocks for Cloud Manager Object Storage operations.
 */

import { sequentialStub } from 'support/stubs/sequential-stub';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { PriceType } from '@linode/api-v4';

/**
 * Intercepts GET requests to fetch network-transfer prices and mocks response.
 *
 * Only returns data for the first request intercepted.
 *
 * @param priceTypes - Object storage buckets with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetPrices = (
  priceTypes: PriceType[]
): Cypress.Chainable<null> => {
  /*
   * Only the first mocked response will contain data. Subsequent responses
   * will contain an empty array.
   *
   * This is necessary because the Object Storage Buckets landing page makes
   * an indeterminate number of requests to `/object-storage/buckets/<region>`,
   * where `<region>` may be any region where Object Storage is supported.
   */
  return cy.intercept(
    'GET',
    apiMatcher('network-transfer/prices?page_size=500'),
    sequentialStub([paginateResponse(priceTypes), paginateResponse([])])
  );
};
