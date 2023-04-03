import { getTickets, SupportTicket } from '@linode/api-v4/lib/support';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const queryKey = `support`;

export const useSupportTicketsQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<SupportTicket>, APIError[]>(
    [`${queryKey}-tickets`, params, filter],
    () => getTickets(params, filter),
    { keepPreviousData: true }
  );
