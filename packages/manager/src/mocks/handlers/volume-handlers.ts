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

import { volumeFactory } from 'src/factories';
import { DateTime } from 'luxon';

import type { StrictResponse } from 'msw';
import type { Volume } from '@linode/api-v4';

export const getVolumes = (mockContext: MockContext) => [
  http.get('*/v4/volumes', () => {
    return makePaginatedResponse(mockContext.volumes);
  }),

  /*
   * Responds with the Volume with the given ID.
   * Responds with a 404 if no Volume with the given ID exists in context.
   */
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

  /*
   * Responds with a list of Volumes that are attached to the given Linode.
   * Responds with a 404 if no Linode with the given ID exists in context.
   */
  http.get(
    '*/v4/linode/instances/:linodeId/volumes',
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

export const createVolumes = (mockContext: MockContext) => [
  /*
   * Responds with a new Volume instance.
   */
  http.post(
    '*/v4/volumes',
    async ({ request }): Promise<StrictResponse<Volume | APIErrorResponse>> => {
      const payload = await request.clone().json();
      const linodeId = payload['linode_id'];

      let volumeLinodePayloadData: Partial<Volume> = {
        linode_id: null,
      };

      if (linodeId) {
        const linode = mockContext.linodes.find(
          (contextLinode) => contextLinode.id === linodeId
        );

        if (!linode) {
          // TODO Handle error when `linodeId` is invalid -- not sure if 400 or 404.
          return makeNotFoundResponse();
        }

        volumeLinodePayloadData = {
          linode_id: linode.id,
          linode_label: linode.label,
        };
      }

      const volume = volumeFactory.build({
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
        label: payload['label'],
        size: payload['size'],
        region: payload['region'],
        ...volumeLinodePayloadData,
      });

      mockContext.volumes.push(volume);
      return makeResponse(volume);
    }
  ),
];

/**
 * Generates MSW handlers for Volume update API operations.
 */
export const updateVolumes = (mockContext: MockContext) => [
  http.post('*/v4/volumes/:id/detach', ({ params }) => {
    const id = Number(params.id);
    const volume = mockContext.volumes.find(
      (contextVolume) => contextVolume.id === id
    );

    if (!volume) {
      return makeNotFoundResponse();
    }

    volume.linode_id = null;
    volume.linode_label = null;
    // TODO queue event.
    return makeResponse({});
  }),
];

export const deleteVolumes = (mockContext: MockContext) => [
  /*
   * Deletes the Volume with the given ID from context and responds with empty object.
   * Responds with a 404 if no Volume with the given ID exists in context.
   */
  http.delete('*/v4/volumes/:id', ({ params }) => {
    const id = Number(params.id);
    const volume = mockContext.volumes.find(
      (contextVolume) => contextVolume.id === id
    );

    if (volume) {
      const volumeIndex = mockContext.volumes.indexOf(volume);
      if (volumeIndex >= 0) {
        mockContext.volumes.splice(volumeIndex, 1);
        return makeResponse({});
      }
    }

    // If Volume does not exist in context, or its index is failed to be retrieved,
    // respond with a 404 response.
    return makeNotFoundResponse();
  }),
];
