import { AttachVolumePayload, CloneVolumePayload, ResizeVolumePayload, UpdateVolumeRequest, VolumeRequestPayload } from 'src/services/volumes';
import { actionCreatorFactory } from 'typescript-fsa';

export interface VolumeId {
  volumeId: number
};

export type UpdateVolumeParams = VolumeId & UpdateVolumeRequest;
export type AttachVolumeParams = VolumeId & AttachVolumePayload;
export type CloneVolumeParams = VolumeId & CloneVolumePayload;
export type ResizeVolumeParams = VolumeId & ResizeVolumePayload;

export const actionCreator = actionCreatorFactory('@@manager/volumes');

export const createVolumeActions = actionCreator.async<VolumeRequestPayload, Linode.Volume, Linode.ApiFieldError[]>(`create`);
export const getOneVolumeActions = actionCreator.async<VolumeId, Linode.Volume, Linode.ApiFieldError[]>(`get-one`)
export const updateVolumeActions = actionCreator.async<UpdateVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(`update`);
export const deleteVolumeActions = actionCreator.async<VolumeId, {}, Linode.ApiFieldError[]>(`delete`);

export const attachVolumeActions = actionCreator.async<AttachVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(`attach`);
export const detachVolumeActions = actionCreator.async<VolumeId, {}, Linode.ApiFieldError[]>(`detach`);

export const cloneVolumeActions = actionCreator.async<CloneVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(`clone`);
export const resizeVolumeActions = actionCreator.async<ResizeVolumeParams, Linode.Volume, Linode.ApiFieldError[]>(`resize`);

export const getAllVolumesActions = actionCreator.async<void, Linode.Volume[], Linode.ApiFieldError[]>('get-all');

export interface UpdateVolumeInStore {
  volumeId: number;
  update: (volume: Linode.Volume) => Linode.Volume;
}
export const updateVolumeInStore = actionCreator<UpdateVolumeInStore>('update-volume-in-store');