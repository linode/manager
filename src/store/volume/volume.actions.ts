import { UpdateVolumeRequest, VolumeRequestPayload } from 'src/services/volumes';
import { actionCreatorFactory } from 'typescript-fsa';

export interface VolumeId{ volumeId: number};

export const actionCreator = actionCreatorFactory('@@manager/volumes');

export const createVolumeActions = actionCreator.async<VolumeRequestPayload, Linode.Volume, Linode.ApiFieldError[]>(`create`);

export type UpdateVolumeParams = VolumeId & UpdateVolumeRequest;
export const updateVolumeActions = actionCreator.async<UpdateVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(`update`);

export const deleteVolumeActions = actionCreator.async<VolumeId, Linode.Volume, Linode.ApiFieldError[]>(`delete`);

export const getAllVolumesActions = actionCreator.async<void, Linode.Volume[], Linode.ApiFieldError[]>('get-all');