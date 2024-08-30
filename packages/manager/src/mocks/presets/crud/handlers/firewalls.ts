import { http } from 'msw';

import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { Firewall } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

// TODO add CRUD handlers
export const getFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4beta/networking/firewalls',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>> => {
      return makePaginatedResponse({
        data: mockState.firewalls,
        request,
      });
    }
  ),
];

// TODO add create, update, delete handlers
