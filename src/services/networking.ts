import Axios from 'axios';
import { API_ROOT } from 'src/constants';

export const updateIP = (address: string, payload: any): Promise<Linode.IPAddress> =>
  Axios.put(`${API_ROOT}/networking/ips/${address}`, payload)
    .then(response => response.data);
