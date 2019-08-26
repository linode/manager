import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage } from '../types';
import { Invoice, InvoiceItem } from './types';

/**
 * getInvoices
 *
 * Retrieve a paginated list of invoices on your account.
 *
 */
export const getInvoices = (params?: any, filter?: any) =>
  Request<ResourcePage<Invoice>>(
    setURL(`${API_ROOT}/account/invoices`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then(response => response.data);

/**
 * getInvoice
 *
 * Retrieve details for a single invoice.
 *
 * @param invoiceId { number } The ID of the invoice to be retrieved
 *
 */
export const getInvoice = (invoiceId: number) =>
  Request<Invoice>(
    setURL(`${API_ROOT}/account/invoices/${invoiceId}`),
    setMethod('GET'),
  ).then(response => response.data);

/**
 * getInvoiceItems
 *
 * Returns a paginated list of invoice items
 *
 * @param invoiceId { number } return items for an invoice with this ID
 *
 *
 */
export const getInvoiceItems = (
  invoiceId: number,
  params?: any,
  filter?: any,
) =>
  Request<ResourcePage<InvoiceItem>>(
    setURL(`${API_ROOT}/account/invoices/${invoiceId}/items`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  ).then(response => response.data);
