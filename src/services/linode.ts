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

export const cancelBackups = (id: number): AxiosPromise =>
  Axios
    .post(`${API_ROOT}/linode/instances/${id}/backups/cancel`);

export const takeSnapshot = (id: number, label: string): AxiosPromise =>
  Axios
    .post(`${API_ROOT}/linode/instances/${id}/backups`, { label });

export const updateBackupsWindow = (id: number, day: string, window: string): AxiosPromise =>
  Axios
    .put(`${API_ROOT}/linode/instances/${id}`,
    { backups: { schedule: { day, window } } });
