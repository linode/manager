import {
  LinodeInterface,
  LinodeInterfacePayload
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/linodeInterfaces`);

interface LinodeIdParam {
  linodeId: number;
}

interface InterfaceIdParam {
  interfaceId: number;
}

/** Get Linode Interfaces (page) */
export type GetLinodeInterfacesParams = LinodeIdParam;
export type GetLinodeInterfacesResponse = Promise<GetAllData<LinodeInterface>>;

export type GetLinodeInterfacesRequest = (
  params: GetLinodeInterfacesParams
) => GetLinodeInterfacesResponse;

/** Get Linode Interfaces (all) */
export type GetAllLinodeInterfacesParams = GetLinodeInterfacesParams;
export type GetAllLinodeInterfacesResponse = GetAllData<LinodeInterface>;

export type GetAllLinodeInterfacesRequest = (
  params: GetAllLinodeInterfacesParams
) => GetAllLinodeInterfacesResponse;

export const getAllLinodeInterfacesActions = actionCreator.async<
  GetAllLinodeInterfacesParams,
  GetAllData<LinodeInterface>,
  APIError[]
>(`get-all`);

/** Get Linode Interface */
export type GetLinodeInterfaceParams = LinodeIdParam & InterfaceIdParam;
export type GetLinodeInterfaceResponse = Promise<LinodeInterface>;

export type GetLinodeInterfaceRequest = (
  params: GetLinodeInterfaceParams
) => GetLinodeInterfaceResponse;

export const getLinodeInterfaceActions = actionCreator.async<
  GetLinodeInterfaceParams,
  LinodeInterface,
  APIError[]
>(`get`);

/** Create Linode Interface */
export type CreateLinodeInterfaceParams = LinodeIdParam &
  LinodeInterfacePayload;
export type CreateLinodeInterfaceResponse = Promise<LinodeInterface>;

export type CreateLinodeInterfaceRequest = (
  params: CreateLinodeInterfaceParams
) => CreateLinodeInterfaceResponse;

export const createLinodeInterfaceActions = actionCreator.async<
  CreateLinodeInterfaceParams,
  LinodeInterface,
  APIError[]
>(`create`);

/** Delete Linode Interface */
export type DeleteLinodeInterfaceParams = GetLinodeInterfaceParams;
export type DeleteLinodeInterfaceResponse = Promise<{}>;

export type DeleteLinodeInterfaceRequest = (
  params: DeleteLinodeInterfaceParams
) => DeleteLinodeInterfaceResponse;

export const deleteLinodeInterfaceActions = actionCreator.async<
  DeleteLinodeInterfaceParams,
  {},
  APIError[]
>(`delete`);
