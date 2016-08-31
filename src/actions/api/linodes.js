import { fetch } from '~/fetch';
import {
  makeFetchPage,
  makeFetchAll,
  makeFetchItem,
  makeFetchUntil,
  makeDeleteItem,
  makePutItem,
  makeCreateItem,
} from '~/api-store';

export const UPDATE_LINODES = '@@linodes/UPDATE_LINODES';
export const UPDATE_LINODE = '@@linodes/UPDATE_LINODE';
export const DELETE_LINODE = '@@linodes/DELETE_LINODE';

export const UPDATE_LINODE_CONFIG = '@@linodes/UPDATE_LINODE_CONFIG';
export const UPDATE_LINODE_CONFIGS = '@@linodes/UPDATE_LINODE_CONFIGS';
export const DELETE_LINODE_CONFIG = '@@linodes/DELETE_LINODE_CONFIG';

export const UPDATE_LINODE_DISK = '@@linodes/UPDATE_LINODE_DISK';
export const UPDATE_LINODE_DISKS = '@@linodes/UPDATE_LINODE_DISKS';
export const DELETE_LINODE_DISK = '@@linodes/DELETE_LINODE_DISK';

export const UPDATE_BACKUPS = '@@backups/UPDATE_BACKUPS';
export const UPDATE_BACKUP = '@@backups/UPDATE_BACKUP';

export const linodeConfig = {
  plural: 'linodes',
  singular: 'linode',
  actions: {
    updateItem: UPDATE_LINODE,
    updateItems: UPDATE_LINODES,
    deleteItem: DELETE_LINODE,
  },
  subresources: {
    _configs: {
      plural: 'configs',
      singular: 'config',
      actions: {
        updateItem: UPDATE_LINODE_CONFIG,
        updateItems: UPDATE_LINODE_CONFIGS,
        deleteItem: DELETE_LINODE_CONFIG,
      },
    },
    _disks: {
      plural: 'disks',
      singular: 'disk',
      actions: {
        updateItem: UPDATE_LINODE_DISK,
        updateItems: UPDATE_LINODE_DISKS,
        deleteItem: DELETE_LINODE_DISK,
      },
    },
    _backups: {
      plural: 'backups',
      singular: 'backup',
      actions: {
        updateItem: UPDATE_BACKUP,
        updateItems: UPDATE_BACKUPS,
      },
    },
  },
};

export const fetchLinodes = makeFetchPage(linodeConfig);
export const fetchAllLinodes = makeFetchAll(linodeConfig, fetchLinodes);

export const fetchLinode = makeFetchItem(linodeConfig);
export const fetchLinodeUntil = makeFetchUntil(linodeConfig);

export const deleteLinode = makeDeleteItem(linodeConfig);
export const putLinode = makePutItem(linodeConfig);
export const createLinode = makeCreateItem(linodeConfig);

export const fetchLinodeDisk = makeFetchItem(linodeConfig, '_disks');
export const fetchLinodeDisks = makeFetchPage(linodeConfig, '_disks');
export const fetchAllLinodeDisks = makeFetchAll(linodeConfig, fetchLinodeDisks, '_disks');

export const deleteLinodeConfig = makeDeleteItem(linodeConfig, '_configs');
export const fetchLinodeConfig = makeFetchItem(linodeConfig, '_configs');
export const fetchLinodeConfigs = makeFetchPage(linodeConfig, '_configs');
export const fetchAllLinodeConfigs = makeFetchAll(linodeConfig, fetchLinodeConfigs, '_configs');

function linodeAction(id, action, temp, expected, timeout = undefined, body = undefined) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: UPDATE_LINODE, linode: { id, state: temp }, linodes: id });
    await fetch(token, `/linodes/${id}/${action}`, { method: 'POST', body });
    await dispatch(fetchLinodeUntil(id, l => l.state === expected, timeout));
  };
}

export function powerOnLinode(id, config = null, timeout = undefined) {
  return linodeAction(id, 'boot', 'booting', 'running', timeout,
    JSON.stringify({ config }));
}

export function powerOffLinode(id, config = null, timeout = undefined) {
  return linodeAction(id, 'shutdown', 'shutting_down', 'offline', timeout,
    JSON.stringify({ config }));
}

export function rebootLinode(id, config = null, timeout = undefined) {
  return linodeAction(id, 'reboot', 'rebooting', 'running', timeout,
    JSON.stringify({ config }));
}

export function resetPassword(linodeId, diskId, password) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linodes/${linodeId}/disks/${diskId}/rootpass`,
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
  };
}
