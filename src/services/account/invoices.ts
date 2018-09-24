import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;

export const getInvoices = (pagination: Linode.PaginationOptions = {}) =>
  Request<Page<Linode.Invoice>>(
    setURL(`${API_ROOT}/account/invoices`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter({ '+order_by': 'date', '+order': 'desc' }),
  )
    .then(response => response.data);

export const getInvoice = (invoiceId: number) =>
  Request<Linode.Invoice>(
    setURL(`${API_ROOT}/account/invoices/${invoiceId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getInvoiceItems = (invoiceId: number, params: any = {}, filters: any = {}) =>
  Request<Page<Linode.InvoiceItem>>(
    setURL(`${API_ROOT}/account/invoices/${invoiceId}/items`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  )
    .then(response => response.data);