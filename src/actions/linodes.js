import { fetch } from '../fetch';
import {
    make_fetch_page,
    make_update_item,
    make_update_until,
    make_delete_item
} from '~/api-store';

export const UPDATE_LINODES = '@@linodes/UPDATE_LINODES';
export const UPDATE_LINODE = '@@linodes/UPDATE_LINODE';
export const DELETE_LINODE = '@@linodes/DELETE_LINODE';

export const fetchLinodes = make_fetch_page(
    UPDATE_LINODES, "linodes");
export const updateLinode = make_update_item(
    UPDATE_LINODE, "linodes", "linode");
export const updateLinodeUntil = make_update_until(
    UPDATE_LINODE, "linodes", "linode");
export const deleteLinode = make_delete_item(
    DELETE_LINODE, "linodes");

export function toggleLinode(linode) {
  return { type: UPDATE_LINODE, linode: { ...linode, _isSelected: !linode._isSelected } };
}

function linodeAction(id, action, temp, expected, timeout=undefined) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: UPDATE_LINODE, linode: { id, state: temp } });
    const response = await fetch(token, `/linodes/${id}/${action}`, { method: 'POST' });
    await dispatch(updateLinodeUntil(id, l => l.state === expected, timeout));
  };
}

export function powerOnLinode(id, timeout=undefined) {
  return linodeAction(id, "boot", "booting", "running", timeout);
}

export function powerOffLinode(id, timeout=undefined) {
  return linodeAction(id, "shutdown", "shutting_down", "offline", timeout);
}

export function rebootLinode(id, timeout=undefined) {
  return linodeAction(id, "reboot", "rebooting", "running", timeout);
}
