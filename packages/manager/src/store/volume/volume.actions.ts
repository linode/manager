import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  UpdateVolumeRequest,
  Volume,
  VolumeRequestPayload,
} from '@linode/api-v4/lib/volumes';
import { GetAllData } from 'src/utilities/getAll';
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
  APIError[]
>(`create`);
export const getOneVolumeActions = actionCreator.async<
  VolumeId,
  Volume,
  APIError[]
>(`get-one`);
export const updateVolumeActions = actionCreator.async<
  UpdateVolumeParams,
  Volume,
  APIError[]
>(`update`);
export const deleteVolumeActions = actionCreator.async<
  VolumeId,
  {},
  APIError[]
>(`delete`);

export const attachVolumeActions = actionCreator.async<
  AttachVolumeParams,
  Volume,
  APIError[]
>(`attach`);
export const detachVolumeActions = actionCreator.async<
  VolumeId,
  {},
  APIError[]
>(`detach`);

export const cloneVolumeActions = actionCreator.async<
  CloneVolumeParams,
  Volume,
  APIError[]
>(`clone`);
export const resizeVolumeActions = actionCreator.async<
  ResizeVolumeParams,
  Volume,
  APIError[]
>(`resize`);

// We want to provide the option NOT to set { loading: true } when requesting all Volumes.
// Specifically, after cloning, we need to "getAllVolumes", but we want to do this "in the background",
// so that the loading spinner doesn't take over the page.
export interface GetAllVolumesOptions {
  setLoading?: boolean;
}
export const getAllVolumesActions = actionCreator.async<
  GetAllVolumesOptions | void,
  GetAllData<Volume>,
  APIError[]
>('get-all');

export interface Params {
  params: any;
  filters: any;
}
export const getVolumesPageActions = actionCreator.async<
  Params,
  ResourcePage<Volume>,
  APIError[]
>('get-page');
