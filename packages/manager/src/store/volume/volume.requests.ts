import { APIError } from 'linode-js-sdk/lib/types';
import {
  attachVolume as _attachVolume,
  cloneVolume as _cloneVolume,
  createVolume as _createVolume,
  deleteVolume as _deleteVolume,
  detachVolume as _detachVolume,
  getVolume as _getVolume,
  getVolumes,
  resizeVolume as _resizeVolume,
  updateVolume as _updateVolume,
  Volume,
  VolumeRequestPayload as _VolumeRequestPayload
} from 'linode-js-sdk/lib/volumes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  attachVolumeActions,
  AttachVolumeParams,
  cloneVolumeActions,
  CloneVolumeParams,
  createVolumeActions,
  deleteVolumeActions,
  detachVolumeActions,
  getAllVolumesActions,
  getOneVolumeActions,
  resizeVolumeActions,
  ResizeVolumeParams,
  updateVolumeActions,
  UpdateVolumeParams,
  VolumeId
} from './volume.actions';

/*
 * Create Volume
 */
export type CreateVolumeRequest = _VolumeRequestPayload;
export const createVolume = createRequestThunk<
  CreateVolumeRequest,
  Volume,
  APIError[]
>(createVolumeActions, data => _createVolume(data));

/*
 * Update Volume
 */
export const updateVolume = createRequestThunk<
  UpdateVolumeParams,
  Volume,
  APIError[]
>(updateVolumeActions, ({ volumeId, ...data }) =>
  _updateVolume(volumeId, data)
);

/*
 * Delete Volume
 */
export const deleteVolume = createRequestThunk<VolumeId, {}, APIError[]>(
  deleteVolumeActions,
  ({ volumeId }) => _deleteVolume(volumeId)
);

/*
 * Attach Volume
 */
export const attachVolume = createRequestThunk<
  AttachVolumeParams,
  Volume,
  APIError[]
>(attachVolumeActions, ({ volumeId, ...data }) =>
  _attachVolume(volumeId, data)
);

/*
 * Detach Volume
 */
export const detachVolume = createRequestThunk<VolumeId, {}, APIError[]>(
  detachVolumeActions,
  ({ volumeId }) => _detachVolume(volumeId)
);

/*
 * Resize Volume
 */
export const resizeVolume = createRequestThunk<
  ResizeVolumeParams,
  Volume,
  APIError[]
>(resizeVolumeActions, ({ volumeId, ...payload }) =>
  _resizeVolume(volumeId, payload)
);

/*
 * Get One Volume
 */
export const getOneVolume = createRequestThunk<VolumeId, Volume, APIError[]>(
  getOneVolumeActions,
  ({ volumeId }) => _getVolume(volumeId)
);

/*
 * Clone Volume
 */
export const cloneVolume = createRequestThunk<
  CloneVolumeParams,
  Volume,
  APIError[]
>(cloneVolumeActions, ({ volumeId, ...payload }) =>
  _cloneVolume(volumeId, payload)
);

/*

* Get All Volumes
*/
const _getAll = getAll<Volume>(getVolumes);

const getAllVolumesRequest = () => _getAll().then(({ data }) => data);

export const getAllVolumes = createRequestThunk(
  getAllVolumesActions,
  getAllVolumesRequest
);
