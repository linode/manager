/**
 * @file Mocks and intercepts related to notification and event handling.
 */

import type { Event, Notification } from '@linode/api-v4';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

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
