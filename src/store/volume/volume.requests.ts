import { createVolume as _createVolume, deleteVolume as _deleteVolume, getVolumes, updateVolume as _updateVolume, VolumeRequestPayload as _VolumeRequestPayload } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { createVolumeActions, deleteVolumeActions, getAllVolumesActions, updateVolumeActions, UpdateVolumeParams, VolumeId } from './volume.actions';

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
* Get All Volumes
*/
const _getAll = getAll<Linode.Volume>(getVolumes);

const getAllVolumesRequest = () => _getAll()
  .then(({ data }) => data);

export const getAllVolumes = createRequestThunk(
  getAllVolumesActions,
  getAllVolumesRequest
);