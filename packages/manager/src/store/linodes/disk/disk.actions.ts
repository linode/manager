import { LinodeDiskCreationData } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { Entity } from './disk.types';

const actionCreator = actionCreatorFactory(`@@manager/linodeDisks`);

interface LinodeIdParam {
  linodeId: number;
}

interface DiskIdParam {
  diskId: number;
}

export type LinodeDiskCreateFields = LinodeDiskCreationData;

export interface LinodeDiskUpdateFields {
  label: string;
}

/** Get Linode Disk (page) */
export type GetLinodeDisksParams = LinodeIdParam;

export type GetLinodeDisksResponse = Promise<Entity[]>;

export type GetLinodeDisksRequest = (
  params: GetLinodeDisksParams
) => GetLinodeDisksResponse;

export const getLinodeDisksActions = actionCreator.async<
  GetLinodeDisksParams,
  Entity[],
  APIError[]
>(`get-page`);

/** Get Linode Disks (all) */
export type GetAllLinodeDisksParams = GetLinodeDisksParams;

export type GetAllLinodeDisksResponse = Promise<Entity[]>;

export type GetAllLinodeDisksRequest = (
  params: GetAllLinodeDisksParams
) => GetAllLinodeDisksResponse;

export const getAllLinodeDisksActions = actionCreator.async<
  GetAllLinodeDisksParams,
  Entity[],
  APIError[]
>(`get-all`);

/** Get Linode Disk */
export type GetLinodeDiskParams = LinodeIdParam & DiskIdParam;

export type GetLinodeDiskResponse = Promise<Entity>;

export type GetLinodeDiskRequest = (
  params: GetLinodeDiskParams
) => GetLinodeDiskResponse;

export const getLinodeDiskActions = actionCreator.async<
  GetLinodeDiskParams,
  Entity,
  APIError[]
>(`get`);

/** Create Linode Disk */
export type CreateLinodeDiskParams = LinodeIdParam & LinodeDiskCreateFields;

export type CreateLinodeDiskResponse = Promise<Entity>;

export type CreateLinodeDiskRequest = (
  params: CreateLinodeDiskParams
) => CreateLinodeDiskResponse;

export const createLinodeDiskActions = actionCreator.async<
  CreateLinodeDiskParams,
  Entity,
  APIError[]
>(`create`);

/** Update Linode Disk */
export type UpdateLinodeDiskParams = GetLinodeDiskParams &
  LinodeDiskUpdateFields;

export type UpdateLinodeDiskResponse = Promise<Entity>;

export type UpdateLinodeDiskRequest = (
  params: UpdateLinodeDiskParams
) => UpdateLinodeDiskResponse;

export const updateLinodeDiskActions = actionCreator.async<
  UpdateLinodeDiskParams,
  Entity,
  APIError[]
>(`update`);

/** Delete Linode Disk */
export type DeleteLinodeDiskParams = GetLinodeDiskParams;

export type DeleteLinodeDiskResponse = Promise<{}>;

export type DeleteLinodeDiskRequest = (
  params: DeleteLinodeDiskParams
) => DeleteLinodeDiskResponse;

export const deleteLinodeDiskActions = actionCreator.async<
  DeleteLinodeDiskParams,
  {},
  APIError[]
>(`delete`);

/** Resize Linode Disk */
export type ResizeLinodeDiskParams = GetLinodeDiskParams & { size: number };

export type ResizeLinodeDiskResponse = Promise<Entity>;

export type ResizeLinodeDiskRequest = (
  params: ResizeLinodeDiskParams
) => ResizeLinodeDiskResponse;

export const resizeLinodeDiskActions = actionCreator.async<
  ResizeLinodeDiskParams,
  Entity,
  APIError[]
>(`resize`);
