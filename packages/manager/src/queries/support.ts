import { getTickets, SupportTicket } from '@linode/api-v4/lib/support';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

const queryKey = `support`;

export const useSupportTicketsQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<SupportTicket>, APIError[]>(
    [`${queryKey}-tickets`, params, filter],
    () => getTickets(params, filter),
    { keepPreviousData: true }
  );
