import { AxiosPromise } from 'axios';
import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL, setXFilter } from 'src/services';

export type EventsPromise = AxiosPromise<Linode.ResourcePage<Linode.Event>>;
export const getEvents = (xFilter: any): EventsPromise => {
  return Request(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setXFilter(xFilter),
  )
    .then((response) => {
      return response;
    });
};
