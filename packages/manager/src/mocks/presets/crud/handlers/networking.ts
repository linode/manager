import { http } from 'msw';

import { ipAddressFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  // makeErrorResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { IPAddress } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getIPAddresses = (mockState: MockState) => [
  http.get(
    '*/v4/networking/ips',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<IPAddress>>
    > => {
      return makePaginatedResponse({
        data: mockState.ipAddresses,
        request,
      });
    }
  ),

  http.get(
    '*/v4/networking/ips/:address',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | IPAddress>> => {
      const ipAddresses = await mswDB.getAll('ipAddresses');
      const ipAddress = ipAddresses?.find(
        ({ address }) => address === params.address
      );

      if (!ipAddress) {
        return makeNotFoundResponse();
      }

      return makeResponse(ipAddress);
    }
  ),
];

export const allocateIP = (mockState: MockState) => [
  http.post(
    '*/v4/networking/ips/',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | IPAddress>> => {
      const payload = await request.clone().json();

      // const linode = await mswDB.get('linodes', Number(payload.linode_id));
      // if (!linode) {
      //   return makeNotFoundResponse();
      // }
      // if (linode.interface_generation === 'linode') {
      //   return makeErrorResponse(
      //     'IPs cannot be allocated for Linodes using new interfaces'
      //   );
      // }
      const ipAddress = ipAddressFactory.build({
        linode_id: payload.linode_id,
        public: payload.public ?? false,
      });

      await mswDB.add('ipAddresses', ipAddress, mockState);

      return makeResponse(ipAddress);
    }
  ),
];

// @TODO Linode Interfaces - add mocks for sharing/assigning IPs
