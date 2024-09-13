import { DateTime } from 'luxon';
import { http } from 'msw';

import { supportTicketFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { SupportTicket } from '@linode/api-v4';
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
        closable: payload['closable'],
        closed: null,
        description: payload['description'],
        entity: {
          id: 10400,
          label: 'linode123456',
          type: 'linode',
          url: '/v4/linode/instances/123456',
        },
        gravatar_id: undefined,
        id: payload['id'],
        opened: DateTime.now().toISO(),
        opened_by: payload['opened_by'],
        status: 'open',
        summary: payload['summary'],
        updated: DateTime.now().toISO(),
        updated_by: null,
      });

      await mswDB.add('supportTickets', supportTicket, mockState);

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
];

// export const getSupportTicket = () => [
//     http.get('*/support/tickets/:ticketId', ({ params }) => {
//         const ticket = supportTicketFactory.build({
//           id: Number(params.ticketId),
//           severity: 1,
//         });
//         return makeResponse(ticket);
//       })
// ]

//   http.get('*/support/tickets/999', () => {
//     const ticket = supportTicketFactory.build({
//       closed: new Date().toISOString(),
//       id: 999,
//     });
//     return HttpResponse.json(ticket);
//   }),

//   http.get('*/support/tickets/:ticketId/replies', () => {
//     const replies = supportReplyFactory.buildList(15);
//     return makeResourcePage(replies);
//   }),
