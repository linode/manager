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
  Linode.ApiFieldError[]
>(createVolumeActions, data => _createVolume(data));

/*
 * Update Volume
 */
export const updateVolume = createRequestThunk<
  UpdateVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(updateVolumeActions, ({ volumeId, ...data }) =>
  _updateVolume(volumeId, data)
);

/*
 * Delete Volume
 */
export const deleteVolume = createRequestThunk<
  VolumeId,
  {},
  Linode.ApiFieldError[]
>(deleteVolumeActions, ({ volumeId }) => _deleteVolume(volumeId));

/*
 * Attach Volume
 */
export const attachVolume = createRequestThunk<
  AttachVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(attachVolumeActions, ({ volumeId, ...data }) =>
  _attachVolume(volumeId, data)
);

/*
 * Detach Volume
 */
export const detachVolume = createRequestThunk<
  VolumeId,
  {},
  Linode.ApiFieldError[]
>(detachVolumeActions, ({ volumeId }) => _detachVolume(volumeId));

/*
 * Resize Volume
 */
export const resizeVolume = createRequestThunk<
  ResizeVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(resizeVolumeActions, ({ volumeId, ...payload }) =>
  _resizeVolume(volumeId, payload)
);

/*
 * Get One Volume
 */
export const getOneVolume = createRequestThunk<
  VolumeId,
  Volume,
  Linode.ApiFieldError[]
>(getOneVolumeActions, ({ volumeId }) => _getVolume(volumeId));

/*
 * Clone Volume
 */
export const cloneVolume = createRequestThunk<
  CloneVolumeParams,
  Volume,
  Linode.ApiFieldError[]
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
