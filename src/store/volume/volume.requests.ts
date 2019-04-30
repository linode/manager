import { AxiosError } from 'axios';
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
  VolumeRequestPayload as _VolumeRequestPayload
} from 'src/services/volumes';
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
  Linode.Volume,
  Error | AxiosError
>(createVolumeActions, data => _createVolume(data));

/*
 * Update Volume
 */
export const updateVolume = createRequestThunk<
  UpdateVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(updateVolumeActions, ({ volumeId, ...data }) =>
  _updateVolume(volumeId, data)
);

/*
 * Delete Volume
 */
export const deleteVolume = createRequestThunk<
  VolumeId,
  {},
  Error | AxiosError
>(deleteVolumeActions, ({ volumeId }) => _deleteVolume(volumeId));

/*
 * Attach Volume
 */
export const attachVolume = createRequestThunk<
  AttachVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(attachVolumeActions, ({ volumeId, ...data }) =>
  _attachVolume(volumeId, data)
);

/*
 * Detach Volume
 */
export const detachVolume = createRequestThunk<
  VolumeId,
  {},
  Error | AxiosError
>(detachVolumeActions, ({ volumeId }) => _detachVolume(volumeId));

/*
 * Resize Volume
 */
export const resizeVolume = createRequestThunk<
  ResizeVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(resizeVolumeActions, ({ volumeId, ...payload }) =>
  _resizeVolume(volumeId, payload)
);

/*
 * Get One Volume
 */
export const getOneVolume = createRequestThunk<
  VolumeId,
  Linode.Volume,
  Error | AxiosError
>(getOneVolumeActions, ({ volumeId }) => _getVolume(volumeId));

/*
 * Clone Volume
 */
export const cloneVolume = createRequestThunk<
  CloneVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(cloneVolumeActions, ({ volumeId, ...payload }) =>
  _cloneVolume(volumeId, payload)
);

/*

* Get All Volumes
*/
const _getAll = getAll<Linode.Volume>(getVolumes);

const getAllVolumesRequest = () => _getAll().then(({ data }) => data);

export const getAllVolumes = createRequestThunk(
  getAllVolumesActions,
  getAllVolumesRequest
);
