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

import type { Stream } from '@linode/api-v4';
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
      const stream = streamFactory.build({
        label: payload['label'],
        type: payload['type'],
        destinations: payload['destinations'].map((destinationId: number) =>
          destinationFactory.build({
            id: destinationId,
            label: `Destination ${destinationId}`,
          })
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
