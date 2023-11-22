import {
  ReplyRequest,
  SupportReply,
  SupportTicket,
  closeSupportTicket,
  createReply,
  getTicket,
  getTicketReplies,
  getTickets,
} from '@linode/api-v4/lib/support';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { EventWithStore } from 'src/events';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';

const queryKey = `tickets`;

export const useSupportTicketsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<SupportTicket>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getTickets(params, filter),
    { keepPreviousData: true }
  );

export const useSupportTicketQuery = (id: number) =>
  useQuery<SupportTicket, APIError[]>([queryKey, 'ticket', id], () =>
    getTicket(id)
  );

export const useInfiniteSupportTicketRepliesQuery = (id: number) =>
  useInfiniteQuery<ResourcePage<SupportReply>, APIError[]>(
    [queryKey, 'ticket', id, 'replies'],
    ({ pageParam }) => getTicketReplies(id, { page: pageParam, page_size: 25 }),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const useSupportTicketReplyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SupportReply, APIError[], ReplyRequest>(createReply, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useSupportTicketCloseMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => closeSupportTicket(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const supportTicketEventHandler = ({ queryClient }: EventWithStore) => {
  queryClient.invalidateQueries([queryKey]);
};
