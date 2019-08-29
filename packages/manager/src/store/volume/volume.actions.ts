import {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  UpdateVolumeRequest,
  Volume,
  VolumeRequestPayload
} from 'linode-js-sdk/lib/volumes';
import { actionCreatorFactory } from 'typescript-fsa';

export interface VolumeId {
  volumeId: number;
}

export type UpdateVolumeParams = VolumeId & UpdateVolumeRequest;
export type AttachVolumeParams = VolumeId & AttachVolumePayload;
export type CloneVolumeParams = VolumeId & CloneVolumePayload;
export type ResizeVolumeParams = VolumeId & ResizeVolumePayload;

export const actionCreator = actionCreatorFactory('@@manager/volumes');

export const createVolumeActions = actionCreator.async<
  VolumeRequestPayload,
  Volume,
  Linode.ApiFieldError[]
>(`create`);
export const getOneVolumeActions = actionCreator.async<
  VolumeId,
  Volume,
  Linode.ApiFieldError[]
>(`get-one`);
export const updateVolumeActions = actionCreator.async<
  UpdateVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(`update`);
export const deleteVolumeActions = actionCreator.async<
  VolumeId,
  {},
  Linode.ApiFieldError[]
>(`delete`);

export const attachVolumeActions = actionCreator.async<
  AttachVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(`attach`);
export const detachVolumeActions = actionCreator.async<
  VolumeId,
  {},
  Linode.ApiFieldError[]
>(`detach`);

export const cloneVolumeActions = actionCreator.async<
  CloneVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(`clone`);
export const resizeVolumeActions = actionCreator.async<
  ResizeVolumeParams,
  Volume,
  Linode.ApiFieldError[]
>(`resize`);

// We want to provide the option NOT to set { loading: true } when requesting all Volumes.
// Specifically, after cloning, we need to "getAllVolumes", but we want to do this "in the background",
// so that the loading spinner doesn't take over the page.
export interface GetAllVolumesOptions {
  setLoading?: boolean;
}
export const getAllVolumesActions = actionCreator.async<
  GetAllVolumesOptions,
  Volume[],
  Linode.ApiFieldError[]
>('get-all');
