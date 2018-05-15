/** Alises for short lines. */
type Page<T> = Linode.ResourcePage<T>;
type Volume = Linode.Volume;

import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setData, setParams } from './index';

export const getVolumesPage = (page: number = 0) =>
  Request<Page<Volume>>(
    setURL(`${API_ROOT}/volumes`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getVolumes = (): Promise<Linode.ResourcePage<Linode.Volume>> =>
  getVolumesPage(1);

export const attach = (volumeId: number, payload: {
  linode_id: number,
  config_id?: number,
}) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
  setMethod('POST'),
  setData(payload),
  );

export const detach = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
  setMethod('POST'),
);

// delete is a reserve word
export const _delete = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('DELETE'),
);

export const clone = (volumeId: number, label: string) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
  setMethod('POST'),
  setData({ label }),
);

export const resize = (volumeId: number, size: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
  setMethod('POST'),
  setData({ size }),
);

export const update = (volumeId: number, label: string) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('PUT'),
  setData({ label }),
);

export type VolumeRequestPayload = {
  label: string,
  size: number,
  region?: string,
  linode_id?: number,
};

export const create = (payload: VolumeRequestPayload) => Request<{}>(
  setURL(`${API_ROOT}/volumes`),
  setMethod('POST'),
  setData(payload),
);
