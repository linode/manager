import Axios from 'axios';
import { API_ROOT } from 'src/constants';

export const getEvents = (headers: any): Promise<Linode.ResourcePage<Linode.Event>> =>
  Axios.get(`${API_ROOT}/account/events`, { headers })
  .then(response => response.data);
