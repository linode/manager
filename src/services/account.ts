import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Event = Linode.Event;
type OAuthClient = Linode.OAuthClient;
type Notification = Linode.Notification;

export const getEvents = (params: any = {}, xFilter: any = {}) =>
  Request<Page<Event>>(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(xFilter),
    setParams(params),
  );

export const markEventsSeen = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/events/${id}/seen`),
    setMethod('POST'),
  );

export const getNotifications = () =>
  Request<Page<Notification>>(
    setURL(`${API_ROOT}/account/notifications`),
    setMethod('GET'),
  )
    .then(response => response.data);

/**
 * OAuth Clients
 */
export const createOAuthClient = (data: any) =>
  Request<OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const getOAuthClient = (id: number) =>
  Request<string>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const resetOAuthClientSecret = (id: number | string) =>
  Request<Linode.OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}/reset-secret`),
    setMethod('POST'),
  )
    .then(response => response.data);

export const updateOAuthClient = (id: number, data: any) =>
  Request<OAuthClient>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deleteOAuthClient = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/oauth-clients/${id}`),
    setMethod('DELETE'),
  );

export const getOAuthClients = () =>
  Request<Page<OAuthClient>>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getUsers = () =>
  Request<Page<Linode.User>>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getAccountInfo = () =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getPayments = (pagination: Linode.PaginationOptions = {}) =>
  Request<Page<Linode.Payment>>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('GET'),
    setParams(pagination),
  )
    .then(response => response.data);

export const getInvoices = (pagination: Linode.PaginationOptions = {}) =>
  Request<Page<Linode.Invoice>>(
    setURL(`${API_ROOT}/account/invoices`),
    setMethod('GET'),
    setParams(pagination),
  )
    .then(response => response.data);

export const updateAccountInfo = (data: Partial<Linode.Account>) =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const getUser = (username: string) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getGrants = (username: string) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const updateGrants = (username: string, data: Partial<Linode.Grants>) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const updateUser = (username: string, data: Partial<Linode.User>) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const createUser = (data: Partial<Linode.User>) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const deleteUser = (username: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);

interface SaveCreditCardData {
  card_number: string,
  expiry_year: number,
  expiry_month: number
}

export const saveCreditCard = (data: SaveCreditCardData) => Request<{}>(
  setURL(`${API_ROOT}/account/credit-card`),
  setMethod('POST'),
  setData(data),
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

export const makePayment = (data: { usd: string, ccv: string }) =>
  Request<Linode.Payment>(
    setURL(`${API_ROOT}/account/payments`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data)
