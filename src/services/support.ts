import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from './index';

type Page<T> = Linode.ResourcePage<T>;
type SupportTicket = Linode.SupportTicket;
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

export const createSupportTicket = (data:TicketRequest) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('POST'),
    setData(data),
  )
