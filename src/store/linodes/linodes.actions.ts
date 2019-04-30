import * as Bluebird from 'bluebird';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import {
  CreateLinodeRequest,
  getLinode,
  getLinodes
} from 'src/services/linodes';
import { getAll } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

/*
non-async actions for the purposes of updating the UI based on an event 
that comes down the stream
*/

export const updateMultipleLinodes = actionCreator<Linode.Linode[]>(
  'update_multiple'
);
export const upsertLinode = actionCreator<Linode.Linode>(`upsert`);
export const deleteLinode = actionCreator<number>('delete');
export const updateLinode = actionCreator<{
  id: number;
  update: (v: Linode.Linode) => Linode.Linode;
}>('update');

/*
  Thunk Actions for the purposes of updating the UI based on some user
  action
 */

interface LinodeID {
  linodeId: number;
}
export type GetLinodeRequest = (params: LinodeID) => GetLinodeResponse;
export type GetLinodeResponse = Promise<Linode.Linode>;

export const getLinodesActions = actionCreator.async<
  void,
  Linode.Linode[],
  Linode.ApiFieldError[]
>('get-all');

export const getLinodeActions = actionCreator.async<
  LinodeID,
  Linode.Linode,
  Linode.ApiFieldError[]
>('get-one');

export type CreateLinodeParams = CreateLinodeRequest;
export const createLinodeActions = actionCreator.async<
  CreateLinodeParams,
  Linode.Linode,
  Linode.ApiFieldError[]
>('create');

export type UpdateLinodeParams = Partial<Linode.Linode> & LinodeID;
export const updateLinodeActions = actionCreator.async<
  UpdateLinodeParams,
  Linode.Linode,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteLinodeParams = LinodeID;
export const deleteLinodeActions = actionCreator.async<
  DeleteLinodeParams,
  {},
  Linode.ApiFieldError[]
>('delete');

export type RebootLinodeParams = LinodeID & { configId?: number };
export const rebootLinodeActions = actionCreator.async<
  RebootLinodeParams,
  {},
  Linode.ApiFieldError[]
>('reboot');

// export const requestLinodes = createRequestThunk(
//   getLinodesActions, () => {
//     return getAll<Linode.Linode>(getLinodes)()
//       .then(getBackupsForLinodes)
//       .catch(e => getAPIErrorOrDefault(e))
//   }
// )

export const requestLinodes: ThunkActionCreator<
  Promise<Linode.Linode[]>
> = () => dispatch => {
  dispatch(getLinodesActions.started);

  return getAll<Linode.Linode>(getLinodes)()
    .then(getBackupsForLinodes)
    .then(result => {
      dispatch(getLinodesActions.done({ result }));
      return result;
    })
    .catch(err => {
      dispatch(
        getLinodesActions.failed({
          error: getAPIErrorOrDefault(
            err,
            'There was an error retrieving your Linodes.'
          )
        })
      );
      return err;
    });
};

const getBackupsForLinodes = ({ data }: { data: Linode.Linode[] }) =>
  Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = ThunkActionCreator<void>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = id => dispatch => {
  getLinode(id)
    .then(response => response.data)
    .then(requestMostRecentBackupForLinode)
    .then(linode => {
      return dispatch(upsertLinode(linode));
    });
};
