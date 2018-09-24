import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Event = Linode.Event;

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