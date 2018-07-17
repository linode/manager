import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Event = Linode.Event;
type OAuthClient = Linode.OAuthClient;
type Notification = Linode.Notification;

export const getEvents = (xFilter: any) =>
  Request<Page<Event>>(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(xFilter),
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

export const getUser = (username: string) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('GET'),
  )
    .then(response => response.data);
