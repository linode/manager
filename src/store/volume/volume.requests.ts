import { createVolume as _createVolume, getVolumes, updateVolume as _updateVolume, UpdateVolumeRequest as _UpdateVolumeRequest, VolumeRequestPayload as _VolumeRequestPayload } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { createVolumeActions, getAllVolumesActions, updateVolumeActions, UpdateVolumeParams } from './volume.actions';

/*
* Create Volume
*/

// Export these types to be used where needed (e.g. volumesRequests container)
export type CreateVolumeRequest = _VolumeRequestPayload;
export type CreateVolumeResponse = Linode.Volume;

export const createVolume = createRequestThunk<CreateVolumeRequest, CreateVolumeResponse, Linode.ApiFieldError[]>(
  createVolumeActions,
  (data) => _createVolume(data)
);

/*
* Update Volume
*/

export type UpdateVolumeRequest = _UpdateVolumeRequest;
export const updateVolume = createRequestThunk<UpdateVolumeParams, CreateVolumeResponse, Linode.ApiFieldError[]>(
  updateVolumeActions,
  ({ volumeId, ...data }) => _updateVolume(volumeId, data)
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