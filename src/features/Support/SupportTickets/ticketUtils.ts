import { getTickets } from 'src/services/support';

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
      return { '+or': [
        {'status': 'open'},
        {'status': 'new'}
      ]};
    case 'closed':
      return { 'status': 'closed'};
    case 'all':
      return {};
    default:
      return new Error('Argument must be "open", "closed", or "null"');
  }
}

/**
 * getTicketsPage
 *
 * Retrieve a single page of support tickets.
 * 
 * @param pagination { Object } any parameters to be sent with the request
 * @param pagination.page { number } the page number to be returned
 * @param pagination.pageSize { number } the number of results to include in the page
 * @param ticketStatus { string } status of the tickets to return (open, closed, or all).
 * 
 * @example getTicketsPage({page: 1, pageSize: 25}, false);
 */
export const getTicketsPage = (pagination: Linode.PaginationOptions = {}, ticketStatus: 'open' | 'closed' | 'all') => {
  const status = getStatusFilter(ticketStatus);
  const ordering = {'+order_by': 'updated', '+order': 'desc'};
  const filter = { ...status, ...ordering};
  return getTickets(pagination, filter).then((response) => response.data);
}
