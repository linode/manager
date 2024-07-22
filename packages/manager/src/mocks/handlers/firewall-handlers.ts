import { http } from 'msw';

import { makePaginatedResponse } from 'src/mocks/utilities/response';

import { getPaginatedSlice } from '../utilities/pagination';

import type { Firewall } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4beta/networking/firewalls',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>> => {
      const url = new URL(request.url);

      const pageNumber = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('page_size')) || 25;
      const totalPages = Math.ceil(mockState.firewalls?.length / pageSize);
      const pageSlice = getPaginatedSlice(
        mockState.firewalls,
        pageNumber,
        pageSize
      );

      return makePaginatedResponse(pageSlice, pageNumber, totalPages);
    }
  ),
];

// TODO add create, update, delete handlers
