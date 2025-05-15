import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type { Invoice, InvoiceItem } from './types';

/**
 * getInvoices
 *
 * Retrieve a paginated list of invoices on your account.
 *
 */
export const getInvoices = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Invoice>>(
    setURL(`${API_ROOT}/account/invoices`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

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
    setURL(`${API_ROOT}/account/invoices/${encodeURIComponent(invoiceId)}`),
    setMethod('GET'),
  );

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
  params?: Params,
  filter?: Filter,
) =>
  Request<ResourcePage<InvoiceItem>>(
    setURL(
      `${API_ROOT}/account/invoices/${encodeURIComponent(invoiceId)}/items`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );
