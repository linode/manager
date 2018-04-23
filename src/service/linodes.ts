import Axios from 'axios';
import { API_ROOT } from 'src/constants';

export const resize = (id: number, type: string): Promise<{}> => Axios
  .post(`${API_ROOT}/linode/instances/${id}/resize`, { type });

