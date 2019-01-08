import * as Bluebird from 'bluebird';
import { Dispatch } from "redux";
import { ThunkAction } from 'redux-thunk';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import { getLinode, getLinodes } from "src/services/linodes";
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory from 'typescript-fsa';

/**
 * Actions
 */
export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

export const updateMultipleLinodes = actionCreator<Linode.Linode[]>('update_multiple')

export const upsertLinode = actionCreator<Linode.Linode>(`upsert`);

export const deleteLinode = actionCreator<number>('delete');

export const updateLinode = actionCreator<{ id: number; update: (v: Linode.Linode) => Linode.Linode }>('update_status');

export const linodesRequest = actionCreator.async<void, Linode.Linode[], Linode.ApiFieldError[]>('request');

export const requestLinodes = () => (dispatch: Dispatch<ApplicationState>) => {
  dispatch(linodesRequest.started);

  return getAll<Linode.Linode>(getLinodes)()
    .then(getBackupsForLinodes)
    .then((result) => {
      dispatch(linodesRequest.done({ result }));
      return result;
    })
    .catch((err) => {
      dispatch(linodesRequest.failed(err));
    });
};

const getBackupsForLinodes = ({ data }: { data: Linode.Linode[] }) => Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = (id) => (dispatch, getState) => {

  getLinode(id)
    .then(response => response.data)
    .then(requestMostRecentBackupForLinode)
    .then(linode => {
      return dispatch(upsertLinode(linode))
    })
};
