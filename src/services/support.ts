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

export const getOpenTicketsPage = (page: number = 0) =>
  getTickets(page, {
    '+or': [
      { status: 'open'},
      { status: 'new' },
    ],
  })

export const getClosedTicketsPage = (page: number = 0) =>
  getTickets(page, {
    status: 'closed',
  })