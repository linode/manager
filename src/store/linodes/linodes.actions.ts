import * as Bluebird from 'bluebird';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import { getLinode, getLinodes } from "src/services/linodes";
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

/**
 * Actions
 */
export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

export const updateMultipleLinodes = actionCreator<Linode.Linode[]>('update_multiple')

export const upsertLinode = actionCreator<Linode.Linode>(`upsert`);

export const deleteLinode = actionCreator<number>('delete');

export const updateLinode = actionCreator<{ id: number; update: (v: Linode.Linode) => Linode.Linode }>('update_status');

export const linodesRequest = actionCreator.async<void, Linode.Linode[], Linode.ApiFieldError[]>('request');

export const requestLinodes: ThunkActionCreator<Promise<Linode.Linode[]>> = () => (dispatch) => {
  dispatch(linodesRequest.started);

  return getAll<Linode.Linode>(getLinodes)()
    .then(getBackupsForLinodes)
    .then((result) => {
      dispatch(linodesRequest.done({ result }));
      return result;
    })
    .catch((err) => {
      dispatch(linodesRequest.failed({ error: getAPIErrorOrDefault(err, 'There was an error retrieving your Linodes.')}));
      return err;
    });
};

const getBackupsForLinodes = ({ data }: { data: Linode.Linode[] }) => Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = ThunkActionCreator<void>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = (id) => (dispatch, getState) => {

  getLinode(id)
    .then(response => response.data)
    .then(requestMostRecentBackupForLinode)
    .then(linode => {
      return dispatch(upsertLinode(linode))
    })
};
