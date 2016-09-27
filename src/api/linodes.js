import { fetch } from '~/fetch';
import { actions, thunks } from './configs/linodes';

function linodeAction(id, action, temp, expected, timeout = undefined, body = undefined) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch(actions.one({ id, state: temp }, id));
    await fetch(token, `/linode/instances/${id}/${action}`, { method: 'POST', body });
    await dispatch(thunks.until(id, l => l.state === expected, timeout));
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
    await fetch(token, `/linode/instances/${linodeId}/disks/${diskId}/rootpass`,
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
  };
}

export function resizeLinodeDisk(linodeId, diskId, size) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch(actions.disks.one({ id: diskId, size }, linodeId, diskId));
    await fetch(token, `/linode/instances/${linodeId}/disks/${diskId}/resize`,
      { method: 'POST', body: JSON.stringify({ size }) });
    // TODO: fetch until complete
  };
}
