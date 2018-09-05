import { merge } from 'ramda';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

type Page<T> = Linode.ResourcePage<T>;
type SupportTicket = Linode.SupportTicket;

export interface ReplyRequest {
  ticket_id: number;
  description: string;
}

export interface TicketRequest {
  summary: string;
  description: string;
  domain_id?: number;
  linode_id?: number;
  longviewclient_id?: number;
  nodebalancer_id?: number;
  volume_id?: number;
}

/**
 * getTickets
 *
 * Base function for retrieving a page of support ticket objects.
 * You should not need to call this function directly.
 * 
 * @param params { Object } any parameters to be sent with the request
 * @param filter { Object } JSON object to be sent as the X-Filter header
 * 
 * @example getTickets(pagination, filter);
 */
export const getTickets = (params?: any, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )

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
  const filter = merge(status, ordering);
  return getTickets(pagination, filter).then((response) => response.data);
}

/**
 * getTicket
 *
 * Retrieve a single support ticket.
 * 
 * @param ticketID { Number } the ID of the ticket to be retrieved
 * @param params { Object } any parameters to be sent with the request
 * @param filter { Object } JSON object to be sent as the X-Filter header
 * 
 * @example getTicket(123456);
 */
export const getTicket = (ticketID:number, params?: any, filter?: any) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets/${ticketID}`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then((response) => response.data);

/**
 * getTicketReplies
 *
 * Get all replies to a single ticket. Returns an
 * array of Reply objects.
 * 
 * @param ticketID { Number } the ID of the ticket
 * @param params { Object } any parameters to be sent with the request
 * @param filter { Object } JSON object to be sent as the X-Filter header
 * 
 * @example getTicketReplies(123456);
 */
export const getTicketReplies = (ticketId:number, params?: any, filter?: any) =>
  Request<Page<Linode.SupportReply>>(
    setURL(`${API_ROOT}/support/tickets/${ticketId}/replies`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then((response) => response.data);

/**
 * getTicketRepliesPage
 *
 * Get a single page of replies to a ticket.
 * 
 * @param ticketID { Number } the ID of the ticket
 * @param pagination { Object } Set of pagination options
 * @param pagination.page { number } the page number to retrieve
 * @param pagination.pageSize { number } the number of replies to include in the page 
 * 
 * @example getTicketReplies(123456. { page: 1, pageSize: 25 });
 */
export const getTicketRepliesPage = (ticketId:number, pagination: Linode.PaginationOptions = {}) => {
  return getTicketReplies(ticketId, pagination).then((response) => response.data);
}


/**
 * createSupportTicket
 *
 * Add a new support ticket.
 * 
 * @param data { Object } the JSON body for the POST request
 * @param data.summary { string } a summary (or title) for the support ticket
 * @param data.description { string } body text of the support ticket
 * 
 * @example createSupportTicket({ summary: "This is a ticket", description: "I'm having a problem with my Linode." });
 */
export const createSupportTicket = (data: TicketRequest) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('POST'),
    setData(data),
  )

/**
 * createReply
 *
 * Reply to a support ticket.
 * 
 * @param data { Object } the ID of the ticket to be retrieved
 * @param data.ticket_id { number } the ID of the ticket
 * @param data.description { string } the text of the reply
 * 
 * @example createReply({ ticket_id: 123456, description: 'This is a reply.' });
 */
export const createReply = (data: ReplyRequest) =>
  Request<Linode.SupportReply>(
    setURL(`${API_ROOT}/support/tickets/${data.ticket_id}/replies`),
    setMethod('POST'),
    setData(data),
)

/**
 * uploadAttachment
 *
 * Attach an image or other file to a support ticket.
 * 
 * @param ticketID { Number } the ID of the ticket to be retrieved
 * @param formData { Object } any parameters to be sent with the request
 * 
 * @example uploadAttachment(123456, {file: file});
 */
export const uploadAttachment = (ticketId: number, formData: FormData) =>
  Request<{}>(
  setURL(`${API_ROOT}/support/tickets/${ticketId}/attachments`),
  setMethod('POST'),
  setData(formData),
);
