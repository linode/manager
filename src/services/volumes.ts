import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setData } from './index';

type GetVolumesPage = Promise<Linode.ResourcePage<Linode.Volume>>;
export const getVolumesPage = (page: number): GetVolumesPage =>
  Request(
    setURL(`${API_ROOT}/volumes/?page=${page}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getVolumes = (): Promise<Linode.ResourcePage<Linode.Volume>> =>
  getVolumesPage(1);

export const attach = (volumeId: number, payload: {
  linode_id: number,
  config_id?: number,
}): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
  setMethod('POST'),
  setData(payload),
  );

export const detach = (volumeId: number): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
  setMethod('POST'),
);

// delete is a reserve word
export const _delete = (volumeId: number): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('DELETE'),
);

export const clone = (volumeId: number, label: string): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
  setMethod('POST'),
  setData({ label }),
);

export const resize = (volumeId: number, size: number): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
  setMethod('POST'),
  setData({ size }),
);

export const update = (volumeId: number, label: string): Promise<{}> => Request(
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

export const create = (payload: VolumeRequestPayload): Promise<{}> => Request(
  setURL(`${API_ROOT}/volumes`),
  setMethod('POST'),
  setData(payload),
);
