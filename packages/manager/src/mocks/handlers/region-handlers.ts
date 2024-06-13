import { http } from 'msw';
import type { MockContext } from 'src/mocks/mockContext';
import { getPaginatedSlice } from '../utilities/pagination';
import {
  makeResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  APIErrorResponse,
} from '../utilities/response';
import type { StrictResponse } from 'msw';
import type { Region } from '@linode/api-v4';

/**
 * HTTP handlers to fetch Regions.
 */
export const getRegions = (mockContext: MockContext) => [
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

  http.get(
    '*/v4*/regions/:id',
    ({ params }): StrictResponse<Region | APIErrorResponse> => {
      const region = mockContext.regions.find(
        (contextRegion) => contextRegion.id === params.id
      );

      if (!region) {
        return makeNotFoundResponse();
      }

      return makeResponse(region);
    }
  ),
];
