import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetLinodesPage = Promise<Linode.ManyResourceState<Linode.Linode>>;
export const getLinodesPage = (page: number): GetLinodesPage =>
  Axios.get(`${API_ROOT}/linode/instances/?page=${page}`)
    .then(response => response.data);

type GetLinodeType = Promise<Linode.ManyResourceState<Linode.Config>>;
export const getLinodeConfigs = (id: number): GetLinodeType =>
Axios.get(`${API_ROOT}/linode/instances/${id}/configs`)
  .then(response => response.data);

type GetLinodeVolumesType = Promise<Linode.ManyResourceState<Linode.Volume>>;
export const getLinodeVolumes = (id: number): GetLinodeVolumesType =>
  Axios.get(`${API_ROOT}/linode/instances/${id}/volumes`)
    .then(response => response.data);
