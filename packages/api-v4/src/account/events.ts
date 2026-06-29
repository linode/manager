import { getEvent, getEvents } from '@akamai/compute-ui-core/events';

import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { Notification } from './types';

export { getEvent, getEvents };

/**
 * markEventSeen
 *
 * Marks all events up to and including the referenced event ID as "seen"
 *
 * @param eventId { number } ID of the event to designate as seen
 */
export const markEventSeen = (eventId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/events/${encodeURIComponent(eventId)}/seen`),
    setMethod('POST'),
  );

/**
 * getNotifications
 *
 * Retrieve a list of active notifications on your account.
 *
 */
export const getNotifications = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Notification>>(
    setURL(`${API_ROOT}/account/notifications`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );
