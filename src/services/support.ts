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
