import { AxiosPromise } from 'axios';
import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL, setHeaders } from 'src/services';

export type EventsPromise = AxiosPromise<Linode.ResourcePage<Linode.Event>>;
export const getEvents = (headers: any): EventsPromise => {
  return Request(
    setURL(`${API_ROOT}/account/events`),
    setMethod('GET'),
    setHeaders(headers),
  ).then((response) => {
    return response;
  });
};
