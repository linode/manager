import { getEvents } from '@linode/api-v4';
import { DateTime } from 'luxon';

import type { CypressPlugin } from './plugin';

// TODO Delete `plugin/fetch-events.ts` and `setup/mock-events-request.ts` when ARB-7116 is addressed.
/**
 * Fetches and caches the last 7-days worth of events on the user's account.
 *
 * This is used as part of a workaround for failures stemming from API performance
 * issues in the events `v4beta` endpoints. By default, Cloud will mock responses
 * to this endpoint using the data that's fetched here so that tests do not time
 * out and fail while awaiting the initial events request.
 *
 * Once the API issue is resolved, this workaround will no longer be needed and
 * should be removed. We expect this to be resolved around Dec 9, 2025.
 */
export const fetchInitialEvents: CypressPlugin = async (_on, config) => {
  // Adapted from `src/queries/events/events.ts` and friends.
  const eventCreatedCutoff = DateTime.now()
    .minus({ days: 7 })
    .setZone('utc')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss");

  const events = await getEvents(undefined, {
    action: { '+neq': 'profile_update' },
    '+order': 'desc',
    '+order_by': 'id',
    created: { '+gt': eventCreatedCutoff },
  });

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerInitialEvents: events,
    },
  };
};
