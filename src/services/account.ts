import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL, setXFilter } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;
type Event = Linode.Event;

export const getEvents = (xFilter: any) =>
  Request<Page<Event>>(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(xFilter),
  )
    .then((response) => {
      return response;
    });
