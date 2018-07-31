import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL, setXFilter } from './index';

/** Alises for short lines. */
type Page<T> = Linode.ResourcePage<T>;
type SupportTicket = Linode.SupportTicket;


export const getTicketsPage = (page: number = 0, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams({ page }),
    setXFilter(filter),
  )

export const getOpenTicketsPage = (page: number = 0) =>
  getTicketsPage(page, {
    '+or': [
      { status: 'open'},
      { status: 'new' },
    ],
  })

export const getClosedTicketsPage = (page: number = 0) =>
  getTicketsPage(page, {
    status: 'closed',
  })