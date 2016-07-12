import { fetch } from '~/fetch';
import {
  makeFetchPage,
  makeFetchItem,
  makeFetchUntil,
  makeDeleteItem,
  makePutItem,
  makeCreateItem,
} from '~/api-store';

export const UPDATE_LINODES = '@@linodes/UPDATE_LINODES';
export const UPDATE_LINODE = '@@linodes/UPDATE_LINODE';
export const DELETE_LINODE = '@@linodes/DELETE_LINODE';
export const PUT_LINODE = '@@linodes/PUT_LINODE';
export const CREATE_LINODE = '@@linodes/CREATE_LINODE';

export const UPDATE_LINODE_CONFIG = '@@linodes/UPDATE_LINODE_CONFIG';
export const UPDATE_LINODE_CONFIGS = '@@linodes/UPDATE_LINODE_CONFIGS';
export const DELETE_LINODE_CONFIG = '@@linodes/DELETE_LINODE_CONFIG';

export const UPDATE_LINODE_DISK = '@@linodes/UPDATE_LINODE_DISK';
export const UPDATE_LINODE_DISKS = '@@linodes/UPDATE_LINODE_DISKS';
export const DELETE_LINODE_DISK = '@@linodes/DELETE_LINODE_DISK';

export const fetchLinodes = makeFetchPage(UPDATE_LINODES, 'linodes');
export const updateLinode = makeFetchItem(UPDATE_LINODE, 'linode', 'linodes');
export const updateLinodeUntil = makeFetchUntil(UPDATE_LINODE, 'linodes', 'linode');
export const deleteLinode = makeDeleteItem(DELETE_LINODE, 'linodes');
export const putLinode = makePutItem(PUT_LINODE, 'linodes');
export const createLinode = makeCreateItem(CREATE_LINODE, 'linodes', 'linode');

export const fetchLinodeDisk = makeFetchItem(UPDATE_LINODE_DISK,
  'disk', 'linodes', 'disks');
export const fetchLinodeDisks = makeFetchPage(UPDATE_LINODE_DISKS,
  'linodes', 'disks');

function linodeAction(id, action, temp, expected, timeout = undefined) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: UPDATE_LINODE, linode: { id, state: temp } });
    await fetch(token, `/linodes/${id}/${action}`, { method: 'POST' });
    await dispatch(updateLinodeUntil(id, l => l.state === expected, timeout));
  };
}

export function powerOnLinode(id, timeout = undefined) {
  return linodeAction(id, 'boot', 'booting', 'running', timeout);
}

export function powerOffLinode(id, timeout = undefined) {
  return linodeAction(id, 'shutdown', 'shutting_down', 'offline', timeout);
}

export function rebootLinode(id, timeout = undefined) {
  return linodeAction(id, 'reboot', 'rebooting', 'running', timeout);
}
