import { http } from 'msw';

import { ipAddressFactory } from 'src/factories';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { IPAddress } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const ipAddresses = ipAddressFactory.buildList(10);

export const getIPAddresses = () => [
  http.get(
    '*/v4/networking/ips',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<IPAddress>>
    > => {
      return makePaginatedResponse({
        data: ipAddresses,
        request,
      });
    }
  ),

  http.get(
    '*/v4/networking/ips/:address',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | IPAddress>> => {
      const ipAddress = ipAddresses.find(
        ({ address }) => address === params.address
      );

      if (!ipAddress) {
        return makeNotFoundResponse();
      }

      return makeResponse(ipAddress);
    }
  ),
];
