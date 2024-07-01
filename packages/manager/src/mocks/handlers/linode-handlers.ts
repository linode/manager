import { DateTime } from 'luxon';
import { http } from 'msw';

import { configFactory, eventFactory, linodeFactory } from 'src/factories';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { getPaginatedSlice } from '../utilities/pagination';

import type { Config, Linode } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockContext } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

/**
 * HTTP handlers to fetch Linodes.
 */
export const getLinodes = (mockContext: MockContext) => [
  // Get an individual Linode's details.
  // Responds with a Linode instance if one exists with ID `id` in context.
  // Otherwise, a 404 response is mocked.
  http.get(
    '*/v4/linode/instances/:id',
    ({ params }): StrictResponse<APIErrorResponse | Linode> => {
      const id = Number(params.id);
      const linode = mockContext.linodes.find(
        (contextLinode) => contextLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }
      return makeResponse(linode);
    }
  ),

  // Get a list of a Linode's configs.
  // Responds with a paginated list of configs if a Linode with ID `id` exists in context.
  // Otherwise, a 404 response is mocked.
  http.get(
    '*/v4/linode/instances/:id/configs',
    ({
      params,
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Config>> => {
      const id = Number(params.id);
      const linode = mockContext.linodes.find(
        (contextLinode) => contextLinode.id === id
      );
      const url = new URL(request.url);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const configs = mockContext.linodeConfigs
        .filter((configTuple) => configTuple[0] === id)
        .map((configTuple) => configTuple[1]);

      const pageNumber = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('page_size')) || 25;
      const totalPages = Math.max(Math.ceil(configs.length / pageSize), 1);

      const pageSlice = getPaginatedSlice(configs, pageNumber, pageSize);
      return makePaginatedResponse(pageSlice, pageNumber, totalPages);
    }
  ),

  // Get all Linodes stored in mock context.
  // Responds with a paginated list of Linodes.
  http.get('*/v4/linode/instances', ({ request }) => {
    const url = new URL(request.url);

    const pageNumber = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 25;
    const totalPages = Math.ceil(mockContext.linodes.length / pageSize);

    const pageSlice = getPaginatedSlice(
      mockContext.linodes,
      pageNumber,
      pageSize
    );
    return makePaginatedResponse(pageSlice, pageNumber, totalPages);
  }),
];

/**
 * HTTP handlers to create Linodes.
 */
export const createLinodes = (mockContext: MockContext) => [
  http.post('*/v4/linode/instances', async ({ request }) => {
    const payload = await request.clone().json();
    const linode = linodeFactory.build({
      created: DateTime.now().toISO(),
      image: payload['image'],
      label: payload['label'],
      region: payload['region'],
      status: 'provisioning',
    });

    // Mock default label behavior when one is not specified.
    if (!linode.label) {
      linode.label = `linode${linode.id}`;
    }

    const linodeConfig = configFactory.build({
      created: DateTime.now().toISO(),
    });

    const linodeEvent = eventFactory.build({
      action: 'linode_create',
      created: DateTime.local().toISO(),
      duration: null,
      entity: {
        id: linode.id,
        label: linode.label,
        type: 'linode',
        url: `/v4/linode/instances/${linode.id}`,
      },
      message: '',
      percent_complete: 0,
      rate: null,
      read: false,
      seen: false,
      status: 'scheduled',
    });

    mockContext.linodes.push(linode);
    mockContext.linodeConfigs.push([linode.id, linodeConfig]);
    mockContext.eventQueue.push([
      linodeEvent,
      (e, context) => {
        if (e.status === 'scheduled') {
          e.status = 'started';
          return false;
        }
        if (e.status === 'started') {
          e.status = 'finished';
          linode.status = 'booting';
        }
        return true;
      },
    ]);

    return makeResponse(linode);
  }),
];
