/**
 * @file Mocks and intercepts related to notification and event handling.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { Event, Notification } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch events and mocks response.
 *
 * @param events - Array of Events with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetEvents = (events: Event[]): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher('account/events*'),
    paginateResponse(events)
  );
};

/**
 * Intercepts polling GET request to fetch events and mocks response.
 *
 * Unlike `mockGetEvents`, this utility only intercepts outgoing requests that
 * occur while Cloud Manager is polling for events.
 *
 * @param events - Array of Events with which to mock response.
 * @param pollingTimestamp - Timestamp to find when identifying polling requests.
 *
 * @returns Cypress chainable.
 */
export const mockGetEventsPolling = (
  events: Event[],
  pollingTimestamp: string
): Cypress.Chainable => {
  return cy.intercept('GET', apiMatcher('account/events*'), (req) => {
    console.log({ headers: req.headers });
    if (
      req.headers['x-filter'].includes(
        `{"created":{"+gte":"${pollingTimestamp}"}}`
      )
    ) {
      req.reply(paginateResponse(events));
    } else {
      req.continue();
    }
  });
};

/**
 * Intercepts POST request to mark an event as seen and mocks response.
 *
 * @param eventId - ID of the event for which to intercept request.
 *
 * @returns Cypress chainable.
 */
export const mockMarkEventSeen = (eventId: number): Cypress.Chainable => {
  return cy.intercept(
    'POST',
    apiMatcher(`account/events/${eventId}/seen`),
    makeResponse({})
  );
};

/**
 * Intercepts GET request to fetch notifications and mocks response.
 *
 * @param notifications - Notifications with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetNotifications = (
  notifications: Notification[]
): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher('account/notifications*'),
    paginateResponse(notifications)
  );
};
