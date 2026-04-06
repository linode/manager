import { DateTime } from 'luxon';
import { http } from 'msw';

import { volumeFactory, volumeTypeFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { PriceType, Volume } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getVolumes = (mockState: MockState) => [
  // Keeping things static for types/prices.
  http.get(
    '*/v4/volumes/types',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<PriceType>>
    > => {
      const volumeTypes = volumeTypeFactory.buildList(3);

      return makePaginatedResponse({
        data: volumeTypes,
        request,
      });
    }
  ),

  http.get(
    '*/v4/volumes',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Volume>>
    > => {
      const volumes = await mswDB.getAll('volumes');

      if (!volumes) {
        return makeNotFoundResponse();
      }
      return makePaginatedResponse({
        data: volumes,
        request,
      });
    }
  ),

  http.get(
    '*/v4/volumes/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Volume>> => {
      const id = Number(params.id);
      const volume = await mswDB.get('volumes', id);

      if (!volume) {
        return makeNotFoundResponse();
      }

      return makeResponse(volume);
    }
  ),

  http.get(
    '*/v4/linode/instances/:linodeId/volumes',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Volume>>
    > => {
      const linodeId = Number(params.linodeId);
      const linode = await mswDB.get('linodes', linodeId);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const volumesForLinode = mockState.volumes.filter(
        (stateVolume) => stateVolume.linode_id === linodeId
      );

      return makePaginatedResponse({
        data: volumesForLinode,
        request,
      });
    }
  ),
];

export const createVolumes = (mockState: MockState) => [
  http.post(
    '*/v4/volumes',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | Volume>> => {
      const payload = await request.clone().json();
      const linodeId = payload['linode_id'];

      let volumeLinodePayloadData: Partial<Volume> = {
        linode_id: null,
      };

      if (linodeId) {
        const linode = await mswDB.get('linodes', linodeId);

        if (!linode) {
          return makeNotFoundResponse();
        }

        volumeLinodePayloadData = {
          linode_id: linode.id,
          linode_label: linode.label,
        };
      }

      const volume = volumeFactory.build({
        created: DateTime.now().toISO(),
        label: payload['label'],
        region: payload['region'],
        size: payload['size'],
        updated: DateTime.now().toISO(),
        ...volumeLinodePayloadData,
      });

      await mswDB.add('volumes', volume, mockState);

      // TODO queue event.
      return makeResponse(volume);
    }
  ),
];

export const updateVolumes = (mockState: MockState) => [
  http.put(
    '*/v4/volumes/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Volume>> => {
      const id = Number(params.id);
      const volume = await mswDB.get('volumes', id);

      if (!volume) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedVolume = { ...volume, ...payload };

      await mswDB.update('volumes', id, updatedVolume, mockState);

      // TODO queue event.
      return makeResponse(updatedVolume);
    }
  ),

  http.post(
    '*/v4/volumes/:id/attach',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const volume = await mswDB.get('volumes', id);
      const payload = await request.clone().json();
      const linodeId = payload.linode_id;
      const linode = await mswDB.get('linodes', linodeId);

      if (!volume) {
        return makeNotFoundResponse();
      }

      const updatedVolume: Volume = {
        ...volume,
        ...payload,
        linode_label: linode?.label,
      };

      await mswDB.update('volumes', id, updatedVolume, mockState);

      // TODO queue event.
      return makeResponse(updatedVolume);
    }
  ),

  http.post(
    '*/v4/volumes/:id/detach',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const volume = await mswDB.get('volumes', id);

      if (!volume) {
        return makeNotFoundResponse();
      }

      const updatedVolume = { ...volume, linode_id: null, linode_label: null };

      await mswDB.update('volumes', id, updatedVolume, mockState);

      // TODO queue event.
      return makeResponse({});
    }
  ),
];

export const deleteVolumes = (mockState: MockState) => [
  http.delete(
    '*/v4/volumes/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const volume = await mswDB.get('volumes', id);

      if (!volume) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('volumes', id, mockState);

      // TODO queue event.
      return makeResponse({});
    }
  ),
];
