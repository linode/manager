import * as Bluebird from 'bluebird';
import {
  createLinode as _createLinode,
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  getLinodes,
  Linode,
  linodeReboot as _rebootLinode,
  updateLinode as _updateLinode
} from 'linode-js-sdk/lib/linodes';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createLinodeActions,
  deleteLinodeActions,
  getLinodeActions,
  getLinodesActions,
  rebootLinodeActions,
  updateLinodeActions,
  upsertLinode
} from './linodes.actions';

export const getLinode = createRequestThunk(getLinodeActions, ({ linodeId }) =>
  _getLinode(linodeId).then(({ data }) => data)
);

export const updateLinode = createRequestThunk(
  updateLinodeActions,
  ({ linodeId, ...data }) => _updateLinode(linodeId, data)
);

export const createLinode = createRequestThunk(createLinodeActions, data =>
  _createLinode(data)
);

export const deleteLinode = createRequestThunk(
  deleteLinodeActions,
  ({ linodeId }) => _deleteLinode(linodeId)
);

export const rebootLinode = createRequestThunk(
  rebootLinodeActions,
  ({ linodeId, configId }) => _rebootLinode(linodeId, configId)
);

const getAllLinodes = (payload: { params?: any; filter?: any }) =>
  getAll<Linode>((passedParams, passedFilter) =>
    getLinodes(passedParams, passedFilter)
  )(payload.params, payload.filter);

export const requestLinodes = createRequestThunk(
  getLinodesActions,
  ({ params, filter }) =>
    getAllLinodes({ params, filter }).then(({ data, results }) =>
      getBackupsForLinodes(data).then(linodesWithBackups => ({
        data: linodesWithBackups,
        results
      }))
    )
);

const getBackupsForLinodes = (data: Linode[]) =>
  Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = ThunkActionCreator<void, number>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = (
  id,
  isCreatingOrUpdating
) => (dispatch, getState) => {
  const state = getState();
  /** Don't request a Linode if it's already been deleted. */
  if (isCreatingOrUpdating || state.__resources.linodes.results.includes(id)) {
    return _getLinode(id)
      .then(response => response.data)
      .then(requestMostRecentBackupForLinode)
      .then(linode => {
        return dispatch(upsertLinode(linode));
      })
      .catch(_ => {
        /**
         * Usually this will fire when we're requesting events for a deleted Linode.
         * Should be safe to ignore, the only cost would be a stale value in the store
         * (if it fails for any other reason).
         */
      });
  } else {
    return Promise.resolve();
  }
};
