import { fetch } from '../fetch';

export const UPDATE_LINODES = '@@linodes/UPDATE_LINODES';
export const UPDATE_LINODE = '@@linodes/UPDATE_LINODE';
export const DELETE_LINODE = '@@linodes/DELETE_LINODE';

export function fetchLinodes(page = 0) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes?page=${page+1}`);
    const json = await response.json();
    dispatch({ type: UPDATE_LINODES, response: json });
  };
}

export function toggleLinode(linode) {
  return { type: UPDATE_LINODE, linode: { ...linode, _isSelected: !linode._isSelected } };
}

export function updateLinode(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}`);
    const json = await response.json();
    dispatch({ type: UPDATE_LINODE, linode: json });
  };
}

export function updateLinodeUntil(id, test, timeout=3000) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const linode = getState().linodes.linodes[id];
    if (linode._polling) {
        return;
    }
    dispatch({ type: UPDATE_LINODE, linode: { id, _polling: true } });
    while (true) {
      const response = await fetch(token, `/linodes/${id}`);
      const json = await response.json();
      dispatch({ type: UPDATE_LINODE, linode: json });
      if (test(json)) break;

      await new Promise(r => setTimeout(r, timeout));
    }
    dispatch({ type: UPDATE_LINODE, linode: { id, _polling: false } });
  };
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

export function deleteLinode(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: DELETE_LINODE, id });
    const response = await fetch(token, `/linodes/${id}`, { method: 'DELETE' });
    const json = await response.json();
    // Note: do we want to do anything at this point?
  };
}
