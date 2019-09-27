import { LinodeConfigCreationData } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { Entity } from './config.types';

const actionCreator = actionCreatorFactory(`@@manager/linodeConfigs`);

interface LinodeIdParam {
  linodeId: number;
}

interface ConfigIdParam {
  configId: number;
}

export type LinodeConfigCreateFields = LinodeConfigCreationData;

export type LinodeConfigUpdateFields = Partial<LinodeConfigCreationData>;

/** Get Linode Configs (page) */
export type GetLinodeConfigsParams = LinodeIdParam;

export type GetLinodeConfigsResponse = Promise<Entity[]>;

export type GetLinodeConfigsRequest = (
  params: GetLinodeConfigsParams
) => GetLinodeConfigsResponse;

export const getLinodeConfigsActions = actionCreator.async<
  GetLinodeConfigsParams,
  Entity[],
  APIError[]
>(`get-page`);

/** Get Linode Configs (all) */
export type GetAllLinodeConfigsParams = GetLinodeConfigsParams;

export type GetAllLinodeConfigsResponse = Promise<Entity[]>;

export type GetAllLinodeConfigsRequest = (
  params: GetAllLinodeConfigsParams
) => GetAllLinodeConfigsResponse;

export const getAllLinodeConfigsActions = actionCreator.async<
  GetAllLinodeConfigsParams,
  Entity[],
  APIError[]
>(`get-all`);

/** Get Linode Config */
export type GetLinodeConfigParams = LinodeIdParam & ConfigIdParam;

export type GetLinodeConfigResponse = Promise<Entity>;

export type GetLinodeConfigRequest = (
  params: GetLinodeConfigParams
) => GetLinodeConfigResponse;

export const getLinodeConfigActions = actionCreator.async<
  GetLinodeConfigParams,
  Entity,
  APIError[]
>(`get`);

/** Create Linode Config */
export type CreateLinodeConfigParams = LinodeIdParam & LinodeConfigCreateFields;

export type CreateLinodeConfigResponse = Promise<Entity>;

export type CreateLinodeConfigRequest = (
  params: CreateLinodeConfigParams
) => CreateLinodeConfigResponse;

export const createLinodeConfigActions = actionCreator.async<
  CreateLinodeConfigParams,
  Entity,
  APIError[]
>(`create`);

/** Update Linode Config */
export type UpdateLinodeConfigParams = GetLinodeConfigParams &
  LinodeConfigUpdateFields;

export type UpdateLinodeConfigResponse = Promise<Entity>;

export type UpdateLinodeConfigRequest = (
  params: UpdateLinodeConfigParams
) => UpdateLinodeConfigResponse;

export const updateLinodeConfigActions = actionCreator.async<
  UpdateLinodeConfigParams,
  Entity,
  APIError[]
>(`update`);

/** Delete Linode Config */
export type DeleteLinodeConfigParams = GetLinodeConfigParams;

export type DeleteLinodeConfigResponse = Promise<{}>;

export type DeleteLinodeConfigRequest = (
  params: DeleteLinodeConfigParams
) => DeleteLinodeConfigResponse;

export const deleteLinodeConfigActions = actionCreator.async<
  DeleteLinodeConfigParams,
  {},
  APIError[]
>(`delete`);
