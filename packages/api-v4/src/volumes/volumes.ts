import {
  CloneVolumeSchema,
  CreateVolumeSchema,
  ResizeVolumeSchema,
  UpdateVolumeSchema,
} from '@linode/validation/lib/volumes.schema';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { ResourcePage as Page } from '../types';
import {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  Volume,
  VolumeRequestPayload,
} from './types';

/**
 * getVolume
 *
 * Returns detailed information about a single Volume.
 *
 * @param volumeId { number } The ID of the volume to be retrieved.
 */
export const getVolume = (volumeId: number) =>
  Request<Volume>(setURL(`${API_ROOT}/volumes/${volumeId}`), setMethod('GET'));

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
    setXFilter(filters)
  );

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

export const attachVolume = (volumeId: number, payload: AttachVolumePayload) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
    setMethod('POST'),
    setData(payload)
  );

/**
 * detachVolume
 *
 * Detaches a Volume on your account from a Linode on your account.
 *
 * @param volumeId { number } The Volume to be detached.
 *
 */
export const detachVolume = (volumeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
    setMethod('POST')
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
export const deleteVolume = (volumeId: number) =>
  Request<{}>(setURL(`${API_ROOT}/volumes/${volumeId}`), setMethod('DELETE'));

/**
 * cloneVolume
 *
 * Creates a Volume on your Account. In order for this request to complete successfully,
 * your User must have the add_volumes grant.
 * The new Volume will have the same size and data as the source Volume
 *
 * @param volumeId { number } The Volume to be detached.
 * @param data { { label: string } } A label to identify the new volume.
 *
 */
export const cloneVolume = (volumeId: number, data: CloneVolumePayload) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
    setMethod('POST'),
    setData(data, CloneVolumeSchema)
  );

/**
 * resizeVolume
 *
 * Resize an existing Volume on your Account. Volumes can only be resized up.
 *
 * @param volumeId { number } The Volume to be resized.
 * @param data { { size: number } } The size of the Volume (in GB).
 *
 */
export const resizeVolume = (volumeId: number, data: ResizeVolumePayload) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
    setMethod('POST'),

    /**
     * Unless we require the old size, we wont be able to validate. We know 10 is the
     * absolute min so it's safe to set here.
     */
    setData(data, ResizeVolumeSchema(10))
  );

export interface UpdateVolumeRequest {
  label: string;
  tags?: string[];
}

/**
 * updateVolume
 *
 * Detaches a Volume on your account from a Linode on your account.
 *
 * @param volumeId { number } The Volume to be updated.
 * @param data { { label: string; tags: string[] } } The updated label for this Volume.
 *
 */
export const updateVolume = (volumeId: number, data: UpdateVolumeRequest) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes/${volumeId}`),
    setMethod('PUT'),
    setData(data, UpdateVolumeSchema)
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
export const createVolume = (data: VolumeRequestPayload) =>
  Request<Volume>(
    setURL(`${API_ROOT}/volumes`),
    setMethod('POST'),
    setData(data, CreateVolumeSchema)
  );
