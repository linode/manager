import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

import { CreateVolumeSchema } from './volumes.schema';

type Page<T> = Linode.ResourcePage<T>;
type Volume = Linode.Volume;

export interface VolumeRequestPayload {
  label: string,
  size?: number,
  region?: string,
  linode_id?: number,
};

/**
 * getVolume
 * 
 * Returns detailed information about a single Volume.
 * 
 * @param volumeId { number } The ID of the volume to be retrieved.
 */
export const getVolume = (volumeId: number) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${volumeId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

/**
 * getVolumes
 * 
 * Returns a paginated list of Volumes on your account.
 * 
 */
export const getVolumes = (params?: any, filters?: any) =>
  Request<Page<Volume>>(
    setURL(`${API_ROOT}/volumes`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  )
    .then(response => response.data);

/**
 * attachVolume
 * 
 * Attaches a Volume on your Account to an existing Linode on your Account.
 * The Volume and Linode must both be in the same region.
 * 
 * @param volumeId { number } The volume to be attached.
 * @param payload { Object }
 * @param payload.linode_id { number } The ID of the linode to attach the Volume to.
 * @param payload.config_id { number } The configuration profile to include this volume in.
 *   If this value is not provided, the most recently booted Config profile will be chosen.
 */
export const attachVolume = (volumeId: number, payload: {
  linode_id: number,
  config_id?: number,
}) => Request<Volume>(
  setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
  setMethod('POST'),
  setData(payload),
);

/**
 * detachVolume
 * 
 * Detaches a Volume on your account from a Linode on your account.
 * 
 * @param volumeId { number } The Volume to be detached.
 * 
 */
export const detachVolume = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
  setMethod('POST'),
);

/**
 * deleteVolume
 * 
 * Deletes a Volume on your account. This can only be done if the Volume
 * is not currently attached to a Linode.
 * 
 * @param volumeId { number } The Volume to be detached.
 * 
 */
export const deleteVolume = (volumeId: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('DELETE'),
);

/**
 * cloneVolume
 * 
 * Creates a Volume on your Account. In order for this request to complete successfully,
 * your User must have the add_volumes grant.
 * The new Volume will have the same size and data as the source Volume
 * 
 * @param volumeId { number } The Volume to be detached.
 * @param label { string } A label to identify the new volume.
 * 
 */
export const cloneVolume = (volumeId: number, label: string) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
  setMethod('POST'),
  setData({ label }),
);

/**
 * resizeVolume
 * 
 * Resize an existing Volume on your Account. Volumes can only be resized up.
 * 
 * @param volumeId { number } The Volume to be resized.
 * @param size { number } The size of the Volume (in GiB).
 * 
 */
export const resizeVolume = (volumeId: number, size: number) => Request<{}>(
  setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
  setMethod('POST'),
  setData({ size }),
);

/**
 * updateVolume
 * 
 * Detaches a Volume on your account from a Linode on your account.
 * 
 * @param volumeId { number } The Volume to be updated.
 * @param label { string } The updated label for this Volume.
 * 
 */
export const updateVolume = (volumeId: number, label: string) => Request<Volume>(
  setURL(`${API_ROOT}/volumes/${volumeId}`),
  setMethod('PUT'),
  setData({ label }),
);

/**
 * createVolume
 * 
 * Creates a new Volume on your account.
 * 
 * @param data { object } The size, label, and region of the new Volume. Can
 * also include a linode_id instead of a region to automatically attach the new Volume
 * to the target Linode.
 * 
 */
export const createVolume = (data: VolumeRequestPayload) => Request<Volume>(
  setURL(`${API_ROOT}/volumes`),
  setMethod('POST'),
  setData(data, CreateVolumeSchema),
);
