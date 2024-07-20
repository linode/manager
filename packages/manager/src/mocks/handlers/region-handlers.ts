import { http } from 'msw';

import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../indexedDB';
import { getPaginatedSlice } from '../utilities/pagination';

import type { Region, RegionAvailability } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockContext } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getRegions = (mockContext: MockContext) => [
  http.get(
    '*/v4*/regions',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Region>>
    > => {
      const url = new URL(request.url);
      const regions = await mswDB.getAll('regions');

      if (!regions) {
        return makeNotFoundResponse();
      }

      const pageNumber = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('page_size')) || 25;
      const totalPages = Math.max(Math.ceil(regions.length / pageSize), 1);

      const pageSlice = getPaginatedSlice(regions, pageNumber, pageSize);

      return makePaginatedResponse(pageSlice, pageNumber, totalPages);
    }
  ),

  http.get(
    '*/v4*/regions/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Region>> => {
      const region = await mswDB.get('regions', Number(params.id));

      if (!region) {
        return makeNotFoundResponse();
      }

      return makeResponse(region);
    }
  ),

  // TODO: integrate with DB
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

  // TODO: integrate with DB
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
