import { MockContext } from 'src/mocks/mockContext';
import { http } from 'msw';
import {
  APIErrorResponse,
  APIPaginatedResponse,
  makePaginatedResponse,
} from 'src/mocks/utilities/response';
import {
  makeNotFoundResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { StrictResponse } from 'msw';
import type { Volume } from '@linode/api-v4';

export const getVolumes = (mockContext: MockContext) => [
  http.get('*/v4/volumes*', () => {
    return makePaginatedResponse(mockContext.volumes);
  }),
  http.get(
    '*/v4/volumes/:id',
    ({ params }): StrictResponse<Volume | APIErrorResponse> => {
      const id = Number(params.id);
      const volume = mockContext.volumes.find(
        (contextVolume) => contextVolume.id === id
      );

      if (!volume) {
        return makeNotFoundResponse();
      }

      return makeResponse(volume);
    }
  ),
  http.get(
    '*/v4/linode/instances/:linodeId/volumes*',
    ({
      params,
    }): StrictResponse<APIPaginatedResponse<Volume> | APIErrorResponse> => {
      const linodeId = Number(params.linodeId);
      const linode = mockContext.linodes.find(
        (contextLinode) => contextLinode.id === linodeId
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const volumesForLinode = mockContext.volumes.filter(
        (contextVolume) => contextVolume.linode_id === linodeId
      );

      // Return paginated response containing all volumes for Linode.
      return makePaginatedResponse(volumesForLinode);
    }
  ),
];
