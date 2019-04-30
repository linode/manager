import { AxiosError } from 'axios';
import {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  UpdateVolumeRequest,
  VolumeRequestPayload
} from 'src/services/volumes';
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
  Linode.Volume,
  Error | AxiosError
>(`create`);
export const getOneVolumeActions = actionCreator.async<
  VolumeId,
  Linode.Volume,
  Error | AxiosError
>(`get-one`);
export const updateVolumeActions = actionCreator.async<
  UpdateVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(`update`);
export const deleteVolumeActions = actionCreator.async<
  VolumeId,
  {},
  Error | AxiosError
>(`delete`);

export const attachVolumeActions = actionCreator.async<
  AttachVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(`attach`);
export const detachVolumeActions = actionCreator.async<
  VolumeId,
  {},
  Error | AxiosError
>(`detach`);

export const cloneVolumeActions = actionCreator.async<
  CloneVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(`clone`);
export const resizeVolumeActions = actionCreator.async<
  ResizeVolumeParams,
  Linode.Volume,
  Error | AxiosError
>(`resize`);

// We want to provide the option NOT to set { loading: true } when requesting all Volumes.
// Specifically, after cloning, we need to "getAllVolumes", but we want to do this "in the background",
// so that the loading spinner doesn't take over the page.
export interface GetAllVolumesOptions {
  setLoading?: boolean;
}
export const getAllVolumesActions = actionCreator.async<
  GetAllVolumesOptions,
  Linode.Volume[],
  Error | AxiosError
>('get-all');
