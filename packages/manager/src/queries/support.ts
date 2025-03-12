import {
  closeSupportTicket,
  createReply,
  createSupportTicket,
  getTicket,
  getTicketReplies,
  getTickets,
} from '@linode/api-v4/lib/support';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  ReplyRequest,
  SupportReply,
  SupportTicket,
  TicketRequest,
} from '@linode/api-v4/lib/support';
import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import type { EventHandlerData } from '@linode/queries';

const supportQueries = createQueryKeys('support', {
  ticket: (id: number) => ({
    contextQueries: {
      replies: {
        queryFn: ({ pageParam }) =>
          getTicketReplies(id, { page: pageParam as number, page_size: 25 }),
        queryKey: null,
      },
    },
    queryFn: () => getTicket(id),
    queryKey: [id],
  }),
  tickets: (params: Params, filter: Filter) => ({
    queryFn: () => getTickets(params, filter),
    queryKey: [params, filter],
  }),
});

export const useSupportTicketsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<SupportTicket>, APIError[]>({
    ...supportQueries.tickets(params, filter),
    placeholderData: keepPreviousData,
  });

export const useSupportTicketQuery = (id: number) =>
  useQuery<SupportTicket, APIError[]>(supportQueries.ticket(id));

export const useCreateSupportTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, APIError[], TicketRequest>({
    mutationFn: createSupportTicket,
    onSuccess(ticket) {
      queryClient.invalidateQueries({ queryKey: supportQueries.tickets._def });
      queryClient.setQueryData<SupportTicket>(
        supportQueries.ticket(ticket.id).queryKey,
        ticket
      );
    },
  });
};

export const useInfiniteSupportTicketRepliesQuery = (id: number) =>
  useInfiniteQuery<ResourcePage<SupportReply>, APIError[]>({
    ...supportQueries.ticket(id)._ctx.replies,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
  });

export const useSupportTicketReplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SupportReply, APIError[], ReplyRequest>({
    mutationFn: createReply,
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: supportQueries.tickets._def,
      });
      queryClient.invalidateQueries({
        queryKey: supportQueries.ticket(variables.ticket_id).queryKey,
      });
    },
  });
};

export const useSupportTicketCloseMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>({
    mutationFn: () => closeSupportTicket(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: supportQueries.tickets._def,
      });
      queryClient.invalidateQueries({
        queryKey: supportQueries.ticket(id).queryKey,
      });
    },
  });
};

export const supportTicketEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  /**
   * Ticket events have entities that look like this:
   *
   * "entity": {
   *   "label": "Great news! We're upgrading your Block Storage",
   *   "id": 3674063,
   *   "type": "ticket",
   *   "url": "/v4/support/tickets/3674063"
   * }
   */

  // Invalidate paginated support tickets
  invalidateQueries({
    queryKey: supportQueries.tickets._def,
  });

  if (event.entity) {
    // If there is an entity associated with the event, invalidate that ticket
    invalidateQueries({
      queryKey: supportQueries.ticket(event.entity.id).queryKey,
    });
  }
};
