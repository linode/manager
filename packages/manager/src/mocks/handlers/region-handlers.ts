import { http } from 'msw';

import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { getPaginatedSlice } from '../utilities/pagination';

import type { Region, RegionAvailability } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockContext } from 'src/mocks/types';
import type { APIErrorResponse } from 'src/mocks/utilities/response';

/**
 * HTTP handlers to fetch Regions.
 */
export const getRegions = (mockContext: MockContext) => [
  // Get a list of regions.
  // Responds with a paginated list of regions in context.
  http.get('*/v4*/regions', ({ request }) => {
    const url = new URL(request.url);

    const pageNumber = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 25;
    const totalPages = Math.max(
      Math.ceil(mockContext.regions.length / pageSize),
      1
    );

    const pageSlice = getPaginatedSlice(
      mockContext.regions,
      pageNumber,
      pageSize
    );

    return makePaginatedResponse(pageSlice, pageNumber, totalPages);
  }),

  // Get an individual region by its ID.
  // Responds with a Region instance if one exists with ID `id` in context.
  // Otherwise, a 404 response is mocked.
  http.get(
    '*/v4*/regions/:id',
    ({ params }): StrictResponse<APIErrorResponse | Region> => {
      const region = mockContext.regions.find(
        (contextRegion) => contextRegion.id === params.id
      );

      if (!region) {
        return makeNotFoundResponse();
      }

      return makeResponse(region);
    }
  ),

  // Get a list of objects that describe region availability.
  // Responds with a paginated list of region availability objects in context.
  http.get('*/v4*/regions/availability', ({ request }) => {
    const url = new URL(request.url);

    const pageNumber = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 25;
    const totalPages = Math.max(
      Math.ceil(mockContext.regions.length / pageSize),
      1
    );

    const pageSlice = getPaginatedSlice(
      mockContext.regions,
      pageNumber,
      pageSize
    );

    return makePaginatedResponse(pageSlice, pageNumber, totalPages);
  }),

  // Get an object that describes availability for the region with a given ID.
  // Responds with an array of RegionAvailability objects for the given region.
  // If no region with the given ID exists in context, a 404 response is mocked.
  http.get(
    '*/v4*/regions/:id/availability',
    ({ params }): StrictResponse<APIErrorResponse | RegionAvailability[]> => {
      const region = mockContext.regions.find(
        (contextRegion) => contextRegion.id === params.id
      );

      if (!region) {
        return makeNotFoundResponse();
      }

      const availabilityObjects = mockContext.regionAvailability.filter(
        (regionAvailability) => regionAvailability.region === region.id
      );
      return makeResponse(availabilityObjects);
    }
  ),
];
