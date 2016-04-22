import { fetch } from '../fetch';

export const UPDATE_LINODES = '@@linodes/UPDATE_LINODES';
export const UPDATE_LINODE = '@@linodes/UPDATE_LINODE';
export const LINODE_RECOVER = '@@linodes/LINODE_RECOVER';

function shouldUpdate(state) {
  if (state.localPage !== state.remotePage) {
    return true;
  }
  // TODO: Other conditions?
  return false;
}

export function updateLinodesIfNecessary() {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, '/linodes');
    const json = await response.json();
    dispatch({ type: UPDATE_LINODES, response: json });
  };
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
    while (true) {
      const response = await fetch(token, `/linodes/${id}`);
      const json = await response.json();
      dispatch({ type: UPDATE_LINODE, linode: json });
      if (test(json)) break;

      await new Promise(r => setTimeout(r, timeout));
    }
  };
}

function linodeAction(id, action, temp, expected) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const linode = state.linodes.linodes.reduce((l, v) => l.id == id ? l : v);
    dispatch({ type: UPDATE_LINODE, linode: { ...linode, state: temp } });
    const response = await fetch(token, `/linodes/${id}/${action}`, { method: 'POST' });
    const json = await response.json();
    dispatch(updateLinodeUntil(id, l => l.state == expected));
  };
}

export function powerOnLinode(id) {
  return linodeAction(id, "boot", "booting", "running");
}

export function powerOffLinode(id) {
  return linodeAction(id, "shutdown", "shutting_down", "offline");
}

export function rebootLinode(id) {
  return linodeAction(id, "reboot", "rebooting", "running");
}

export function toggleLinodeRecovery(id, recover) {
  return { type: LINODE_RECOVER, linode: { id }, recover };
}
