import { attachVolume as _attachVolume, createVolume as _createVolume, deleteVolume as _deleteVolume, detachVolume as _detachVolume, getVolume as _getVolume, getVolumes, updateVolume as _updateVolume, VolumeRequestPayload as _VolumeRequestPayload } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { attachVolumeActions, AttachVolumeParams, createVolumeActions, deleteVolumeActions, detachVolumeActions, getAllVolumesActions, getOneVolumeActions, updateVolumeActions, UpdateVolumeParams, VolumeId } from './volume.actions';

/*
* Create Volume
*/
export type CreateVolumeRequest = _VolumeRequestPayload;
export const createVolume = createRequestThunk<CreateVolumeRequest, Linode.Volume, Linode.ApiFieldError[]>(
  createVolumeActions,
  (data) => _createVolume(data)
);

/*
* Update Volume
*/
export const updateVolume = createRequestThunk<UpdateVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(
  updateVolumeActions,
  ({ volumeId, ...data }) => _updateVolume(volumeId, data)
);

/*
* Delete Volume
*/
export const deleteVolume = createRequestThunk<VolumeId, {}, Linode.ApiFieldError[]>(
  deleteVolumeActions,
  ({ volumeId }) => _deleteVolume(volumeId)
);

/*
* Attach Volume
*/
export const attachVolume = createRequestThunk<AttachVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(
  attachVolumeActions,
  ({ volumeId, ...data }) => _attachVolume(volumeId, data)
);

/*
* Detach Volume
*/
export const detachVolume = createRequestThunk<VolumeId, {}, Linode.ApiFieldError[]>(
  detachVolumeActions,
  ({ volumeId }) => _detachVolume(volumeId)
);

/*
* Get One Volume
*/
export const getOneVolume = createRequestThunk<VolumeId, Linode.Volume, Linode.ApiFieldError[]>(
  getOneVolumeActions,
  ({ volumeId }) => {
    return _getVolume(volumeId)}
);


/*
* Get All Volumes
*/
const _getAll = getAll<Linode.Volume>(getVolumes);

const getAllVolumesRequest = () => _getAll()
  .then(({ data }) => data);

export const getAllVolumes = createRequestThunk(
  getAllVolumesActions,
  getAllVolumesRequest
);