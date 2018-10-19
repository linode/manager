import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

/** Alises for short lines. */
type Page<T> = Linode.ResourcePage<T>;
type Volume = Linode.Volume;

export interface VolumeRequestPayload {
  label: string,
  size: number,
  region?: string,
  linode_id?: number,
};

export const getVolume = (id: number) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${id}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getVolumes = (params: any = {}, filters: any = {}) =>
  Request<Page<Volume>>(
    setURL(`${API_ROOT}/volumes`),
    setMethod('GET'),
    setParams(params),
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

export const updateVolume = (volumeId: number, label: string) => Request<Linode.Volume>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('PUT'),
  setData({ label }),
);

export const createVolume = (payload: VolumeRequestPayload) => Request<{}>(
  setURL(`${API_ROOT}/volumes`),
  setMethod('POST'),
  setData(payload),
);
