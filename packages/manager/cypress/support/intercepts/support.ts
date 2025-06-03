/**
 * @file Cypress mock and intercept utilities for Help & Support API requests.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { SupportReply, SupportTicket } from '@linode/api-v4';

/**
 * Intercepts request to open a support ticket and mocks response.
 *
 * @param ticket - Support ticket object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateSupportTicket = (
  ticket: SupportTicket
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('support/tickets'),
    makeResponse(ticket)
  );
};

/**
 * Intercepts request to open a support ticket and mocks error response.
 *
 * @param errorMessage - Mocks an error response with the given message.
 *
 * @returns Cypress chainable.
 */
export const mockCreateSupportTicketError = (
  errorMessage: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('support/tickets'),
    makeErrorResponse(errorMessage)
  );
};

/**
 * Interepts request to attach file to support ticket and mocks response.
 *
 * @param ticketId - Support ticket ID for which to intercept request.
 *
 * @returns Cypress chainable.
 */
export const mockAttachSupportTicketFile = (ticketId: number) => {
  return cy.intercept(
    'POST',
    apiMatcher(`support/tickets/${ticketId}/attachments`),
    {}
  );
};

/**
 * Intercepts request to fetch a support ticket and mocks response.
 *
 * @param ticket - Support ticket object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetSupportTicket = (
  ticket: SupportTicket
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`support/tickets/${ticket.id}`),
    makeResponse(ticket)
  );
};

/**
 * Interepts request to close a support ticket and mocks response.
 *
 * @param ticketId - Numeric ID of support ticket for which to mock replies.
 *
 * @returns Cypress chainable.
 */
export const mockCloseSupportTicket = (
  ticketId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`support/tickets/${ticketId}/close`),
    makeResponse({})
  );
};

/**
 * Intercepts request to fetch open support tickets and mocks response.
 *
 * @param tickets - Array of support ticket objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetSupportTickets = (
  tickets: SupportTicket[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('support/tickets*'),
    paginateResponse(tickets)
  );
};

/**
 * Interepts request to fetch a support ticket's replies and mocks response.
 *
 * @param ticketId - Numeric ID of support ticket for which to mock replies.
 * @param replies - Array of support ticket reply objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetSupportTicketReplies = (
  ticketId: number,
  replies: SupportReply[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`support/tickets/${ticketId}/replies*`),
    paginateResponse(replies)
  );
};
