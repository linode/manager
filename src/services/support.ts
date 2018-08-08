import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from './index';

export type Page<T> = Linode.ResourcePage<T>;
export type SupportTicket = Linode.SupportTicket;
export type SupportReply = Linode.SupportReply;
interface TicketRequest {
  summary: string;
  description: string;
  domain_id?: number;
  linode_id?: number;
  longviewclient_id?: number;
  nodebalancer_id?: number;
  volume_id?: number;
}

export const getTickets = (params?: any, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )

export const getTicketsPage = (pagination: Linode.PaginationOptions = {}, open?:boolean) => {
  const filter = open
    ? {
      '+or': [
        { status: 'open'},
        { status: 'new' },
      ],
    }
    : { status: 'closed'}

  return getTickets(pagination, filter).then((response) => response.data);
}

export const getTicket = (ticketID:number, params?: any, filter?: any) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets/${ticketID}`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then((response) => response.data);

export const getTicketReplies = (ticketId:number, params?: any, filter?: any) =>
  Request<Page<SupportReply>>(
    setURL(`${API_ROOT}/support/tickets/${ticketId}/replies`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then((response) => response.data);

export const getTicketRepliesPage = (ticketId:number, pagination: Linode.PaginationOptions = {}) => {
  return getTicketReplies(ticketId, pagination).then((response) => response.data);
}

export const createSupportTicket = (data:TicketRequest) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('POST'),
    setData(data),
  )
