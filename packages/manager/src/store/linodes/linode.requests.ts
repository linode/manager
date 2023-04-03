import { Filter, Params } from '@linode/api-v4';
import {
  createLinode as _createLinode,
  deleteLinode as _deleteLinode,
  getLinode as _getLinode,
  getLinodes,
  Linode,
  linodeReboot as _rebootLinode,
  updateLinode as _updateLinode,
} from '@linode/api-v4/lib/linodes';
import { queryClient } from 'src/queries/base';
import { queryKey as firewallsQueryKey } from 'src/queries/firewalls';
import { getAllLinodeFirewalls } from 'src/queries/linodes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createLinodeActions,
  deleteLinodeActions,
  getLinodeActions,
  getLinodesActions,
  getLinodesPageActions,
  rebootLinodeActions,
  updateLinodeActions,
  upsertLinode,
} from './linodes.actions';

export const getLinode = createRequestThunk(getLinodeActions, ({ linodeId }) =>
  _getLinode(linodeId)
);

export const updateLinode = createRequestThunk(
  updateLinodeActions,
  ({ linodeId, ...data }) => _updateLinode(linodeId, data)
);

export const createLinode = createRequestThunk(createLinodeActions, (data) =>
  _createLinode(data)
);

export const deleteLinode = createRequestThunk(
  deleteLinodeActions,
  async ({ linodeId }) => {
    // Before we delete a Linode, we need to see what firewalls
    // are associated with it so that we can update the firewalls
    // UI to no longer include the deleted linode.
    const firewalls = await getAllLinodeFirewalls(linodeId);

    const response = await _deleteLinode(linodeId);

    for (const firewall of firewalls) {
      queryClient.invalidateQueries([
        firewallsQueryKey,
        'firewall',
        firewall.id,
        'devices',
      ]);
    }

    return response;
  }
);

export const rebootLinode = createRequestThunk(
  rebootLinodeActions,
  ({ linodeId, configId }) => _rebootLinode(linodeId, configId)
);

const getAllLinodes = (payload: { params?: Params; filter?: Filter }) =>
  getAll<Linode>((passedParams, passedFilter) =>
    getLinodes(passedParams, passedFilter)
  )(payload.params, payload.filter);

export const requestLinodes = createRequestThunk(
  getLinodesActions,
  ({ params, filter }) => getAllLinodes({ params, filter })
);

/**
 * Single page of Linodes
 */
export const getLinodesPage = createRequestThunk(
  getLinodesPageActions,
  ({ params, filters }) => getLinodes(params, filters)
);

type RequestLinodeForStoreThunk = ThunkActionCreator<void, number>;
export const requestLinodeForStore: RequestLinodeForStoreThunk = (
  id,
  isCreatingOrUpdating
) => (dispatch, getState) => {
  const state = getState();
  /** Don't request a Linode if it's already been deleted. */
  if (
    isCreatingOrUpdating ||
    Boolean(state.__resources.linodes.itemsById[id])
  ) {
    return _getLinode(id)
      .then((linode) => {
        return dispatch(upsertLinode(linode));
      })
      .catch((_) => {
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
