import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { Event, Notification } from './types';

/**
 * getEvents
 *
 * Retrieve a list of events on your account.
 *
 */
export const getEvents = (params: Params = {}, filter: Filter = {}) =>
  Request<ResourcePage<Event>>(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );

/**
 * getEvent
 *
 * Retrieve details about a single event.
 *
 */
export const getEvent = (eventId: number) =>
  Request<Event>(
    setURL(`${API_ROOT}/account/events/${encodeURIComponent(eventId)}`),
    setMethod('GET'),
  );

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
 * markEventRead
 *
 * Set the "read" property of an event to true
 *
 * @param eventId { number } ID of the event to designate as read
 *
 * @deprecated As of `5/20/2025`, this endpoint is deprecated. It will be sunset on `6/17/2025`.
 *
 * If you depend on using `read`, you may be able to use `markEventSeen` and `seen` instead.
 * Please note that the `seen` endpoint functions differently and will mark all events up to and including the referenced event ID as "seen" rather than individual events.
 */
export const markEventRead = (eventId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/events/${encodeURIComponent(eventId)}/read`),
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
