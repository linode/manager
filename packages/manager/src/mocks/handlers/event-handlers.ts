import { DateTime } from 'luxon';
import { http } from 'msw';

import { mswDB } from '../indexedDB';
import { getPaginatedSlice } from '../utilities/pagination';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from '../utilities/response';

import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from '../utilities/response';
import type { Event } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockContext, MockEventProgressHandler } from 'src/mocks/types';

/**
 * Filters events by their `created` date.
 *
 * Events with `created` dates in the future are filtered out.
 *
 * @param event - Event to filter.
 *
 * @returns `true` if event's created date is in the past, `false` otherwise.
 */
const filterEventsByCreatedTime = (
  eventQueueItem: [Event, MockEventProgressHandler | null]
): boolean => {
  const event = eventQueueItem?.[0];
  if (!event) {
    return false;
  }

  return DateTime.fromISO(event.created) <= DateTime.now();
};

/**
 * Simulates event progression by executing a callback that may mutate the event or context.
 */
const progressEvent = (
  eventQueueItem: [Event, MockEventProgressHandler | null],
  context: MockContext
) => {
  const [event, handler] = eventQueueItem;

  if (handler) {
    const result = handler(event, context);
    // If handler responds with `true`, replace the handler with `null` to prevent further execution.
    if (result) {
      eventQueueItem[1] = null;
    }
  }
};

export const getEvents = (mockContext: MockContext) => [
  http.get(
    '*/v4*/events',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Event>>
    > => {
      const url = new URL(request.url);
      const eventQueue = await mswDB.getAll('eventQueue');

      if (!eventQueue) {
        return makeNotFoundResponse();
      }

      const pageNumber = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('page_size')) || 25;
      const totalPages = Math.max(Math.ceil(eventQueue.length / pageSize), 1);

      const events = eventQueue
        .filter(filterEventsByCreatedTime)
        .map((queuedEvent) => {
          progressEvent(queuedEvent, mockContext);

          return queuedEvent[0];
        });

      const pageSlice = getPaginatedSlice(events, pageNumber, pageSize);

      return makePaginatedResponse(pageSlice, pageNumber, totalPages);
    }
  ),

  http.get(
    '*/v4*/events/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Event>> => {
      const id = Number(params.id);
      const event = await mswDB.get('eventQueue', id);

      if (!event) {
        return makeNotFoundResponse();
      }

      progressEvent(event, mockContext);

      return makeResponse(event[0]);
    }
  ),
];

export const updateEvents = (mockContext: MockContext) => [
  // Marks all events up to and including the event with the given ID as seen.
  http.post('*/v4*/events/:id/seen', async ({ params }) => {
    const id = Number(params.id);
    const eventQueue = await mswDB.getAll('eventQueue');

    if (!eventQueue) {
      return makeNotFoundResponse();
    }

    eventQueue.forEach(async (eventQueueItem) => {
      if (eventQueueItem[0].id <= id) {
        const updatedEvent = {
          ...eventQueueItem[0],
          seen: true,
        };

        await mswDB.update(
          'eventQueue',
          eventQueueItem[0].id,
          updatedEvent as any,
          mockContext
        );
      }
    });

    // API-v4 responds with a 200 and empty object regardless of whether the
    // requested event actually exists (or belongs to the requesting user).
    return makeResponse({});
  }),
  // Marks all events up to and including the event with the given ID as read.
  http.post('*/v4*/events/:id/read', async ({ params }) => {
    const id = Number(params.id);
    const eventQueue = await mswDB.getAll('eventQueue');

    if (!eventQueue) {
      return makeNotFoundResponse();
    }

    eventQueue.forEach(async (eventQueueItem) => {
      if (eventQueueItem[0].id <= id) {
        const updatedEvent = {
          ...eventQueueItem[0],
          read: true,
        };

        await mswDB.update(
          'eventQueue',
          eventQueueItem[0].id,
          updatedEvent as any,
          mockContext
        );
      }
    });

    // API-v4 responds with a 200 and empty object regardless of whether the
    // requested event actually exists (or belongs to the requesting user).
    return makeResponse({});
  }),
];
