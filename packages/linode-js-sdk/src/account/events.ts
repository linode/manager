import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage } from '../types';
import { Event, Notification } from './types';

/**
 * getEvents
 *
 * Retrieve a list of events on your account.
 *
 */
export const getEvents = (params: any = {}, filter: any = {}) =>
  Request<ResourcePage<Event>>(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  ).then(response => response.data);

/**
 * getEvent
 *
 * Retrieve details about a single event.
 *
 */
export const getEvent = (eventId: number) =>
  Request<Event>(
    setURL(`${API_ROOT}/account/events/${eventId}`),
    setMethod('GET'),
  );

/**
 * markEventSeen
 *
 * Set the "seen" property of an event to true
 *
 * @param eventId { number } ID of the event to designate as seen
 */
export const markEventSeen = (eventId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/events/${eventId}/seen`),
    setMethod('POST'),
  );

/**
 * markEventRead
 *
 * Set the "read" property of an event to true
 *
 * @param eventId { number } ID of the event to designate as read
 *
 */
export const markEventRead = (eventId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/events/${eventId}/read`),
    setMethod('POST'),
  );

/**
 * getNotifications
 *
 * Retrieve a list of active notifications on your account.
 *
 */
export const getNotifications = () =>
  Request<ResourcePage<Notification>>(
    setURL(`${API_ROOT}/account/notifications`),
    setMethod('GET'),
  ).then(response => response.data);
