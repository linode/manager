import {
  APIError,
  ResourcePage,
  getTickets,
  SupportTicket,
} from '@linode/api-v4';
import { useQuery } from 'react-query';

const queryKey = `support`;

export const useSupportTicketsQuery = (params: any, filter: any) =>
  useQuery<ResourcePage<SupportTicket>, APIError[]>(
    [`${queryKey}-tickets`, params, filter],
    () => getTickets(params, filter),
    { keepPreviousData: true }
  );
