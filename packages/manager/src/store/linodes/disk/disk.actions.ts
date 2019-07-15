import { LinodeDiskCreationData } from 'src/services/linodes';
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
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
  Linode.ApiFieldError[]
>(`resize`);
