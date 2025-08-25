import { DateTime } from 'luxon';
import { http } from 'msw';

import { destinationFactory, streamFactory } from 'src/factories/datastream';
import { mswDB } from 'src/mocks/indexedDB';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeErrorResponse,
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

export const updateStream = (mockState: MockState) => [
  http.put(
    '*/v4beta/monitor/streams/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Stream>> => {
      const id = Number(params.id);
      const stream = await mswDB.get('streams', id);

      if (!stream) {
        return makeNotFoundResponse();
      }

      const destinations = await mswDB.getAll('destinations');
      const payload = await request.clone().json();
      const updatedStream = {
        ...stream,
        ...payload,
        destinations: payload['destinations'].map((destinationId: number) =>
          destinations?.find(({ id }) => id === destinationId)
        ),
        updated: DateTime.now().toISO(),
      };

      await mswDB.update('streams', id, updatedStream, mockState);

      queueEvents({
        event: {
          action: 'stream_update',
          entity: {
            id: stream.id,
            label: stream.label,
            type: 'stream',
            url: `/v4beta/monitor/streams/${stream.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedStream);
    }
  ),
];

export const deleteStream = (mockState: MockState) => [
  http.delete(
    '*/v4beta/monitor/streams/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const stream = await mswDB.get('streams', id);

      if (!stream) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('streams', id, mockState);

      queueEvents({
        event: {
          action: 'stream_delete',
          entity: {
            id: stream.id,
            label: stream.label,
            type: 'domain',
            url: `/v4beta/monitor/streams/${stream.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
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

export const updateDestination = (mockState: MockState) => [
  http.put(
    '*/v4beta/monitor/streams/destinations/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Destination>> => {
      const id = Number(params.id);
      const destination = await mswDB.get('destinations', id);

      if (!destination) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const [majorVersion, minorVersion] = destination.version.split('.');
      const updatedDestination = {
        ...destination,
        ...payload,
        version: `${majorVersion}.${+minorVersion + 1}`,
        updated: DateTime.now().toISO(),
      };

      await mswDB.update('destinations', id, updatedDestination, mockState);

      queueEvents({
        event: {
          action: 'destination_update',
          entity: {
            id: destination.id,
            label: destination.label,
            type: 'stream',
            url: `/v4beta/monitor/streams/${destination.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedDestination);
    }
  ),
];

export const deleteDestination = (mockState: MockState) => [
  http.delete(
    '*/v4beta/monitor/streams/destinations/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const destination = await mswDB.get('destinations', id);
      const streams = await mswDB.getAll('streams');
      const currentlyAttachedDestinations = new Set(
        streams?.flatMap(({ destinations }) =>
          destinations?.map(({ id }) => id)
        )
      );

      if (!destination) {
        return makeNotFoundResponse();
      }

      if (currentlyAttachedDestinations.has(id)) {
        return makeErrorResponse(
          `Destination with id ${id} is attached to a stream and cannot be deleted`,
          409
        );
      }

      await mswDB.delete('destinations', id, mockState);

      queueEvents({
        event: {
          action: 'destination_delete',
          entity: {
            id: destination.id,
            label: destination.label,
            type: 'domain',
            url: `/v4beta/monitor/streams/${destination.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];
