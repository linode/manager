import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL, setXFilter } from './index';

type Page<T> = Linode.ResourcePage<T>;
type SupportTicket = Linode.SupportTicket;

export const getTickets = (params?: any, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )

export const getOpenTicketsPage = (pagination: Linode.PaginationOptions = {}) =>
  getTickets(pagination, {
    '+or': [
      { status: 'open'},
      { status: 'new' },
    ],
  }).then((response) => response.data);

export const getClosedTicketsPage = (pagination: Linode.PaginationOptions = {}) =>
  getTickets(pagination, {
    status: 'closed',
  }).then((response) => response.data);