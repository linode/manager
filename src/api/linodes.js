import { fetch } from '~/fetch';
import { linodes as thunks } from '~/api';
import { actions } from './configs/linodes';

export const LINODE_STATUS_TRANSITION_RESULT = {
  booting: 'running',
  shutting_down: 'offline',
  rebooting: 'running',
};

function linodeAction(id, action, temp, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch(actions.one({ state: temp }, id));

    const rsp = await fetch(token, `/linode/instances/${id}/${action}`, { method: 'POST', body });
    await dispatch(thunks.until(l => l.status === LINODE_STATUS_TRANSITION_RESULT[temp], id));
    if (handleRsp) {
      await dispatch(handleRsp(await rsp.json()));
    }
  };
}

export function powerOnLinode(id, config = null) {
  return linodeAction(id, 'boot', 'booting',
    JSON.stringify({ config }));
}

export function powerOffLinode(id, config = null) {
  return linodeAction(id, 'shutdown', 'shutting_down',
    JSON.stringify({ config }));
}

export function rebootLinode(id, config = null) {
  return linodeAction(id, 'reboot', 'rebooting',
    JSON.stringify({ config }));
}

export function rebuildLinode(id, config = null) {
  function makeNormalResponse(rsp, resource) {
    return {
      page: 1,
      totalPages: 1,
      totalResults: rsp[resource].length,
      [resource]: rsp[resource],
    };
  }

  function handleRsp(rsp) {
    return async (dispatch) => {
      await dispatch(actions.disks.invalidate([id], false));
      await dispatch(actions.disks.many(makeNormalResponse(rsp, 'disks'), id));
      await dispatch(actions.configs.invalidate([id], false));
      await dispatch(actions.configs.many(makeNormalResponse(rsp, 'configs'), id));
    };
  }

  return linodeAction(id, 'rebuild', 'rebuilding',
                      JSON.stringify(config), handleRsp);
}

export function lishToken(linodeId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const result = await fetch(token, `/linode/instances/${linodeId}/lish_token`,
                                      { method: 'POST' });
    return await result.json();
  };
}

export function resetPassword(linodeId, diskId, password) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linode/instances/${linodeId}/disks/${diskId}/password`,
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
