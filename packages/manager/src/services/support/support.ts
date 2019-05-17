import { createReplySchema, createSupportTicketSchema } from './support.schema';

import { API_ROOT } from 'src/constants';

import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';

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
 *
 * @param params { Object } any parameters to be sent with the request
 * @param filter { Object } JSON object to be sent as the X-Filter header
 *
 *
 */
export const getTickets = (params?: any, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getTicket
 *
 * Retrieve a single support ticket.
 *
 * @param ticketID { Number } the ID of the ticket to be retrieved
 * @param params { Object } any parameters to be sent with the request
 * @param filter { Object } JSON object to be sent as the X-Filter header
 *
 */
export const getTicket = (ticketID: number) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets/${ticketID}`),
    setMethod('GET')
  ).then(response => response.data);

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
 *
 */
export const getTicketReplies = (
  ticketId: number,
  params?: any,
  filter?: any
) =>
  Request<Page<Linode.SupportReply>>(
    setURL(`${API_ROOT}/support/tickets/${ticketId}/replies`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);

/**
 * createSupportTicket
 *
 * Add a new support ticket.
 *
 * @param data { Object } the JSON body for the POST request
 * @param data.summary { string } a summary (or title) for the support ticket
 * @param data.description { string } body text of the support ticket
 *
 */
export const createSupportTicket = (data: TicketRequest) =>
  Request<SupportTicket>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('POST'),
    setData(data, createSupportTicketSchema)
  ).then(response => response.data);

/**
 * closeSupportTicket
 *
 * Close a single support ticket. This will only succeed if the ticket
 * is marked as "closable," which is a field on the ticket object. Tickets
 * opened by Linode are generally not closable through the API.
 *
 * @param ticketID { Number } the ID of the ticket to be closed
 *
 */
export const closeSupportTicket = (ticketId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/support/tickets/${ticketId}/close`),
    setMethod('POST')
  ).then(response => response.data);

/**
 * createReply
 *
 * Reply to a support ticket.
 *
 * @param data { Object } the ID of the ticket to be retrieved
 * @param data.ticket_id { number } the ID of the ticket
 * @param data.description { string } the text of the reply
 * @param validate { boolean } whether to run the validation schema against the request
 *
 */
export const createReply = (data: ReplyRequest) =>
  Request<Linode.SupportReply>(
    setURL(`${API_ROOT}/support/tickets/${data.ticket_id}/replies`),
    setMethod('POST'),
    setData(data, createReplySchema)
  ).then(response => response.data);

/**
 * uploadAttachment
 *
 * Attach an image or other file to a support ticket.
 *
 * @param ticketID { Number } the ID of the ticket to be retrieved
 * @param formData { Object } any parameters to be sent with the request
 *
 */
export const uploadAttachment = (ticketId: number, formData: FormData) =>
  Request<{}>(
    setURL(`${API_ROOT}/support/tickets/${ticketId}/attachments`),
    setMethod('POST'),
    setData(formData)
  ).then(response => response.data);
