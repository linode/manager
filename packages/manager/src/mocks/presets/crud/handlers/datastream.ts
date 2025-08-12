import { DateTime } from 'luxon';
import { http } from 'msw';

import { destinationFactory, streamFactory } from 'src/factories/datastream';
import { mswDB } from 'src/mocks/indexedDB';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { Destination, Stream } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getStreams = () => [
  http.get(
    '*/v4beta/monitor/streams',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Stream>>
    > => {
      const streams = await mswDB.getAll('streams');

      if (!streams) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: streams,
        request,
      });
    }
  ),
  http.get(
    '*/v4beta/monitor/streams/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Stream>> => {
      const id = Number(params.id);
      const stream = await mswDB.get('streams', id);

      if (!stream) {
        return makeNotFoundResponse();
      }

      return makeResponse(stream);
    }
  ),
];

export const createStreams = (mockState: MockState) => [
  http.post(
    '*/v4beta/monitor/streams',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | Stream>> => {
      const payload = await request.clone().json();
      const destinations = await mswDB.getAll('destinations');

      const stream = streamFactory.build({
        label: payload['label'],
        type: payload['type'],
        destinations: payload['destinations'].map((destinationId: number) =>
          destinations?.find(({ id }) => id === destinationId)
        ),
        details: payload['details'],
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('streams', stream, mockState);

      queueEvents({
        event: {
          action: 'stream_create',
          entity: {
            id: stream.id,
            label: stream.label,
            type: 'stream',
            url: `/v4beta/datastream/streams`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(stream);
    }
  ),
];

export const getDestinations = () => [
  http.get(
    '*/v4beta/monitor/streams/destinations',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Destination>>
    > => {
      const destinations = await mswDB.getAll('destinations');

      if (!destinations) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: destinations,
        request,
      });
    }
  ),
  http.get(
    '*/v4beta/monitor/streams/destinations/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | Destination>> => {
      const id = Number(params.id);
      const destination = await mswDB.get('destinations', id);

      if (!destination) {
        return makeNotFoundResponse();
      }

      return makeResponse(destination);
    }
  ),
];

export const createDestinations = (mockState: MockState) => [
  http.post(
    '*/v4beta/monitor/streams/destinations',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | Destination>> => {
      const payload = await request.clone().json();
      const destination = destinationFactory.build({
        label: payload['label'],
        type: payload['type'],
        details: payload['details'],
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('destinations', destination, mockState);

      queueEvents({
        event: {
          action: 'destination_create',
          entity: {
            id: destination.id,
            label: destination.label,
            type: 'destination',
            url: `/v4beta/datastream/streams/destinations`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(destination);
    }
  ),
];
