import { DateTime } from 'luxon';
import { http } from 'msw';

import { supportReplyFactory, supportTicketFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { queueEvents } from 'src/mocks/utilities/events';
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
        description: payload['description'],
        entity: {
          id: 1,
          label: 'mock-linode-1',
          type: 'linode',
          url: '/v4/linode/instances/1',
        },
        opened: DateTime.now().toISO(),
        severity: 1,
        status: 'open',
        summary: payload['summary'],
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('supportTickets', supportTicket, mockState);

      queueEvents({
        event: {
          action: 'ticket_create',
          entity: {
            id: supportTicket.id,
            label: supportTicket.summary,
            type: 'support_ticket',
            url: `/v4/support/tickets/${supportTicket.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

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

    return makeResponse({});
  }),
];

export const getSupportTicketReplies = () => [
  http.get(
    '*/support/tickets/:ticketId/replies',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<SupportReply>>
    > => {
      const id = Number(params.ticketId);
      const supportReplies = await mswDB.get('supportReplies', id);

      if (!supportReplies) {
        return makePaginatedResponse({
          data: [],
          request,
        });
      }
      return makePaginatedResponse({
        data: [supportReplies],
        request,
      });
    }
  ),
];

export const createSupportTicketReply = (mockState: MockState) => [
  http.post(
    '*/support/tickets/:ticketId/replies',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | SupportReply>> => {
      const payload = await request.clone().json();
      const id = Number(params.ticketId);
      const supportTicket = await mswDB.get('supportTickets', id);

      const supportTicketReply = supportReplyFactory.build({
        created_by: 'test-account',
        description: payload['description'],
        friendly_name: 'test-account',
        from_linode: false,
      });

      await mswDB.add('supportReplies', supportTicketReply, mockState);

      queueEvents({
        event: {
          action: 'ticket_update',
          entity: {
            id: supportTicket?.id ?? -1,
            label: supportTicket?.summary ?? null,
            type: 'support_ticket',
            url: `/v4/support/tickets/${supportTicket?.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(supportTicketReply);
    }
  ),
];
