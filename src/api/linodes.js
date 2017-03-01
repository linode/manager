import { fetch } from '~/fetch';
import { actions } from './configs/linodes';

export const RANDOM_PROGRESS_MAX = 75;
export const RANDOM_PROGRESS_MIN = 40;

export function randomInitialProgress() {
  return Math.random() * (RANDOM_PROGRESS_MAX - RANDOM_PROGRESS_MIN) + RANDOM_PROGRESS_MIN;
}

function linodeAction(id, action, temp, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch(actions.one({ status: temp, __progress: 1 }, id));
    await new Promise(resolve => setTimeout(resolve, 0));
    dispatch(actions.one({ __progress: randomInitialProgress() }, id));

    const rsp = await fetch(token, `/linode/instances/${id}/${action}`, { method: 'POST', body });
    dispatch(actions.one({ ...body }, id));
    if (handleRsp) {
      dispatch(handleRsp(await rsp.json()));
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

export function rescueLinode(id, disks = null) {
  return linodeAction(id, 'rescue', 'rebooting',
    JSON.stringify({ disks }));
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

export function linodeIPs(linodeId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/linode/instances/${linodeId}/ips`);
    const json = { _ips: await response.json() };
    dispatch(actions.one(json, linodeId));
  };
}

export function addIP(linodeId, type) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linode/instances/${linodeId}/ips`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    dispatch(linodeIPs(linodeId));
  };
}

export function reverseDNS(linodeId, ipId, rdns) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/v4/linode/instances/${linodeId}/ips/${ipId}`, {
      method: 'PUT',
      body: JSON.stringify({ rdns }),
    });
  };
}

export function resetRDNS() {}

export function linodeBackups(linodeId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/linode/instances/${linodeId}/backups`);
    const json = { _backups: await response.json() };
    dispatch(actions.one(json, linodeId));
  };
}
