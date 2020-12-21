import { CreateLinodeRequest, Linode } from '@linode/api-v4/lib/linodes';
import { APIError, DeepPartial, ResourcePage } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

/*
non-async actions for the purposes of updating the UI based on an event
that comes down the stream
*/

export const updateMultipleLinodes = actionCreator<Linode[]>('update_multiple');
export const upsertLinode = actionCreator<Linode>(`upsert`);
export const deleteLinode = actionCreator<number>('delete');

/*
  Thunk Actions for the purposes of updating the UI based on some user
  action
 */

interface LinodeID {
  linodeId: number;
}
export type GetLinodeRequest = (params: LinodeID) => GetLinodeResponse;
export type GetLinodeResponse = Promise<Linode>;

export const getLinodesActions = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<Linode>,
  APIError[]
>('get-all');

export const getLinodeActions = actionCreator.async<
  LinodeID,
  Linode,
  APIError[]
>('get-one');

export type CreateLinodeParams = CreateLinodeRequest;
export const createLinodeActions = actionCreator.async<
  CreateLinodeParams,
  Linode,
  APIError[]
>('create');

export type UpdateLinodeParams = DeepPartial<Linode> & LinodeID;
export const updateLinodeActions = actionCreator.async<
  UpdateLinodeParams,
  Linode,
  APIError[]
>(`update`);

export type DeleteLinodeParams = LinodeID;
export const deleteLinodeActions = actionCreator.async<
  DeleteLinodeParams,
  {},
  APIError[]
>('delete');

export type RebootLinodeParams = LinodeID & { configId?: number };
export const rebootLinodeActions = actionCreator.async<
  RebootLinodeParams,
  {},
  APIError[]
>('reboot');

export interface PageParams {
  params?: any;
  filters?: any;
}
export const getLinodesPageActions = actionCreator.async<
  PageParams,
  ResourcePage<Linode>,
  APIError[]
>('get-page');
