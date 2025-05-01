import {
  createReplySchema,
  createSupportTicketSchema,
} from '@linode/validation/lib/support.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  ReplyRequest,
  SupportReply,
  SupportTicket,
  TicketRequest,
} from './types';

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
export const getTickets = (params?: Params, filter?: Filter) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
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
    setURL(`${API_ROOT}/support/tickets/${encodeURIComponent(ticketID)}`),
    setMethod('GET'),
  );

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
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<SupportReply>>(
    setURL(
      `${API_ROOT}/support/tickets/${encodeURIComponent(ticketId)}/replies`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

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
    setData(data, createSupportTicketSchema),
  );

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
    setURL(`${API_ROOT}/support/tickets/${encodeURIComponent(ticketId)}/close`),
    setMethod('POST'),
  );

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
  Request<SupportReply>(
    setURL(
      `${API_ROOT}/support/tickets/${encodeURIComponent(
        data.ticket_id,
      )}/replies`,
    ),
    setMethod('POST'),
    setData(data, createReplySchema),
  );

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
    setURL(
      `${API_ROOT}/support/tickets/${encodeURIComponent(ticketId)}/attachments`,
    ),
    setMethod('POST'),
    setData(formData),
  );
