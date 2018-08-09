import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from './index';

/** Alises for short lines. */
type Page<T> = Linode.ResourcePage<T>;
type Volume = Linode.Volume;

export const getVolumes = (pagination: any = {}, filters: any = {}) =>
  Request<Page<Volume>>(
    setURL(`${API_ROOT}/volumes`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter(filters),
  )
    .then(response => response.data);

export const attachVolume = (volumeId: number, payload: {
  linode_id: number,
  config_id?: number,
}) => Request<Volume>(
  setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
  setMethod('POST'),
  setData(payload),
  );

export const detachVolume = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
  setMethod('POST'),
);

// delete is a reserve word
export const deleteVolume = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('DELETE'),
);

export const cloneVolume = (volumeId: number, label: string) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
  setMethod('POST'),
  setData({ label }),
);

export const resizeVolume = (volumeId: number, size: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
  setMethod('POST'),
  setData({ size }),
);

export const updateVolume = (volumeId: number, label: string) => Request<{}>(
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

export const createVolume = (payload: VolumeRequestPayload) => Request<{}>(
  setURL(`${API_ROOT}/volumes`),
  setMethod('POST'),
  setData(payload),
);
