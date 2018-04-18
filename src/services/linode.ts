import Axios, { AxiosPromise } from 'axios';
import { API_ROOT } from 'src/constants';

type GetLinodeType = Promise<Linode.ManyResourceState<Linode.Config>>;
export const getLinodeConfigs = (id: number): GetLinodeType =>
Axios.get(`${API_ROOT}/linode/instances/${id}/configs`)
  .then(response => response.data);

type GetLinodeVolumesType = Promise<Linode.ManyResourceState<Linode.Volume>>;
export const getLinodeVolumes = (id: number): GetLinodeVolumesType =>
  Axios.get(`${API_ROOT}/linode/instances/${id}/volumes`)
    .then(response => response.data);

type GetLinodeBackupsType = Promise<Linode.ManyResourceState<Linode.LinodeBackup>>;
export const getLinodeBackups = (id: number): GetLinodeBackupsType =>
  Axios.get(`${API_ROOT}/linode/instances/${id}/backups`)
    .then(response => response.data);

export const enableBackups = (id: number): AxiosPromise =>
  Axios
    .post(`${API_ROOT}/linode/instances/${id}/backups/enable`);
