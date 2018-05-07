import Axios, { AxiosPromise } from 'axios';
import { API_ROOT } from 'src/constants';

export type EventsPromise = AxiosPromise<Linode.ResourcePage<Linode.Event>>;
export const getEvents = (headers: any): EventsPromise =>
  Axios.get(`${API_ROOT}/account/events`, { headers });
