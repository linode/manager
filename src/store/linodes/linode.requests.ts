import * as Bluebird from 'bluebird';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import {
  createLinode as _createLinode,
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  getLinodes,
  linodeReboot as _rebootLinode,
  updateLinode as _updateLinode
} from 'src/services/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
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
            'There was an error retrieving your Linodes. Please try again later.'
          )
        })
      );
      return err;
    });
};

const getBackupsForLinodes = ({ data }: { data: Linode.Linode[] }) =>
  Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = ThunkActionCreator<void>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = id => (
  dispatch,
  getState
) => {
  const state = getState();
  /** Don't request a Linode if it's already been deleted. */
  if (state.__resources.linodes.results.includes(id)) {
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
    return;
  }
};
