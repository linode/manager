import Axios from 'axios';
import { API_ROOT } from 'src/constants';

export const getVolumes = (): Promise<Linode.ManyResourceState<Linode.Volume>> =>
  Axios
    .get(`${API_ROOT}/volumes`)
    .then(response => response.data);

export const attach = (volumeId: number) => (linodeId: number): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/attach`, { linode_id: linodeId });

export const detach = (volumeId: number): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/detach`);

/* delete is a reserved word */
export const _delete = (volumeId: number): Promise<{}> =>
  Axios
    .delete(`${API_ROOT}/volumes/${volumeId}`);

export const clone = (volumeId: number, label: string): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/clone`, { label });

export const resize = (volumeId: number, size: number): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/resize`, { size });

export const update = (volumeId: number, label: string): Promise<{}> =>
  Axios
    .put(`${API_ROOT}/volumes/${volumeId}`, { label });

export const create = (
  label: string,
  size: number,
  region: string,
  linodeId?: number,
): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes`, { label, size, region, linode_id: linodeId });
