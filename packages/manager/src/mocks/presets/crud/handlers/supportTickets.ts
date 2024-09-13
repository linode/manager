import { DateTime } from 'luxon';
import { http } from 'msw';

import { supportTicketFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { SupportReply, SupportTicket } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const createSupportTicket = (mockState: MockState) => [
  http.post(
    '*/support/tickets',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | SupportTicket>> => {
      const payload = await request.clone().json();

      const supportTicket = supportTicketFactory.build({
        closable: true,
        closed: null,
        description: payload['description'],
        // TODO: handle dynamic entity selection
        entity: {
          id: 10400,
          label: 'linode123456',
          type: 'linode',
          url: '/v4/linode/instances/123456',
        },
        gravatar_id: undefined,
        opened: DateTime.now().toISO(),
        opened_by: 'linode',
        status: 'open',
        summary: payload['summary'],
        updated: DateTime.now().toISO(),
        updated_by: null,
      });

      await mswDB.add('supportTickets', supportTicket, mockState);

      // TODO: event

      return makeResponse(supportTicket);
    }
  ),
];

export const getSupportTickets = () => [
  http.get(
    '*/support/tickets',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<SupportTicket>>
    > => {
      const supportTickets = await mswDB.getAll('supportTickets');

      if (!supportTickets) {
        return makeNotFoundResponse();
      }
      return makePaginatedResponse({
        data: supportTickets,
        request,
      });
    }
  ),
  http.get(
    '*/support/tickets/:ticketId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | SupportTicket>> => {
      const id = Number(params.ticketId);
      const supportTicket = await mswDB.get('supportTickets', id);

      if (!supportTicket) {
        return makeNotFoundResponse();
      }
      return makeResponse(supportTicket);
    }
  ),
];

export const getSupportTicketReplies = () => [
  http.get(
    '*/support/tickets/:ticketId/replies*',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<SupportReply>>
    > => {
      const supportReplies = await mswDB.getAll('supportReplies');

      if (!supportReplies) {
        return makeNotFoundResponse();
      }
      return makePaginatedResponse({
        data: supportReplies,
        request,
      });
    }
  ),
];

export const closeSupportTicket = (mockState: MockState) => [
  http.post('*/support/tickets/:ticketId/close', async ({ params }) => {
    const id = Number(params.ticketId);
    const supportTicket = await mswDB.get('supportTickets', id);

    if (!supportTicket) {
      return makeNotFoundResponse();
    }

    mswDB.update(
      'supportTickets',
      id,
      { ...supportTicket, closed: DateTime.now().toISO(), status: 'closed' },
      mockState
    );

    // TODO: event

    return makeResponse({});
  }),
];
