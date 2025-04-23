import { DateTime } from 'luxon';
import { http } from 'msw';

import { mswDB } from '../../../indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from '../../../utilities/response';

import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from '../../../utilities/response';
import type { Event } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';

/**
 * Filters events by their `created` date.
 *
 * Events with `created` dates in the future are filtered out.
 *
 * @param event - Event to filter.
 *
 * @returns `true` if event's created date is in the past, `false` otherwise.
 */
const filterEventsByCreatedTime = (eventQueueItem: Event): boolean => {
  if (!eventQueueItem) {
    return false;
  }

  return DateTime.fromISO(eventQueueItem.created) <= DateTime.now();
};

export const getEvents = () => [
  http.get(
    '*/v4*/events',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Event>>
    > => {
      const eventQueue = await mswDB.getAll('eventQueue');

      if (!eventQueue) {
        return makeNotFoundResponse();
      }
      const events = eventQueue.filter(filterEventsByCreatedTime);

      return makePaginatedResponse({
        data: events,
        request,
      });
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

      return makeResponse(event);
    }
  ),
];

export const updateEvents = (mockState: MockState) => [
  http.post('*/v4*/events/:id/seen', async ({ params }) => {
    const id = Number(params.id);
    const eventQueue = await mswDB.getAll('eventQueue');

    if (!eventQueue) {
      return makeNotFoundResponse();
    }

    eventQueue.forEach(async (eventQueueItem) => {
      if (eventQueueItem.id <= id) {
        const updatedEvent = {
          ...eventQueueItem,
          seen: true,
        };

        await mswDB.update(
          'eventQueue',
          eventQueueItem.id,
          updatedEvent,
          mockState
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
      if (eventQueueItem.id <= id) {
        const updatedEvent = {
          ...eventQueueItem,
          read: true,
        };

        await mswDB.update(
          'eventQueue',
          eventQueueItem.id,
          updatedEvent as any,
          mockState
        );
      }
    });

    // API-v4 responds with a 200 and empty object regardless of whether the
    // requested event actually exists (or belongs to the requesting user).
    return makeResponse({});
  }),
];
