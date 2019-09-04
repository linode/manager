import { getTickets } from 'linode-js-sdk/lib/support';

/**
 * getStatusFilter
 *
 * Private helper function to generate an X-Filter object based on a status string.
 *
 * @param ticketStatus { string } status of the tickets to return (open, closed, or all).
 *
 * @example getTicketStatus('closed');
 */
const getStatusFilter = (ticketStatus: 'open' | 'closed' | 'all') => {
  switch (ticketStatus) {
    case 'open':
      return { '+or': [{ status: 'open' }, { status: 'new' }] };
    case 'closed':
      return { status: 'closed' };
    case 'all':
      return {};
    default:
      return new Error('Argument must be "open", "closed", or "all"');
  }
};

/**
 * getTicketsPage
 *
 * Retrieve a single page of support tickets.
 *
 * @param params { Object } parameters to pass to the API; in most cases these will be pagination parameters
 * @param filters { Object } filters to be passed as the X-Filter header to the API.
 * @param ticketStatus { string } status of the tickets to return (open, closed, or all).
 *
 * @example getTicketsPage({page: 1, pageSize: 25}, false);
 */
export const getTicketsPage = (
  params: any,
  filters: any,
  ticketStatus: 'open' | 'closed' | 'all'
) => {
  const status = getStatusFilter(ticketStatus);
  const ordering = { '+order_by': 'updated', '+order': 'desc' };
  const filter = { ...status, ...ordering, ...filters };
  return getTickets(params, filter).then(response => response.data);
};
