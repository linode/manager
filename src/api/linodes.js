import { fetch } from '~/fetch';

import { actions } from './configs/linodes';
import { thunkFetch } from './apiActionReducerGenerator';


function linodeAction(id, action, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const rsp = await fetch(token, `/linode/instances/${id}/${action}`, { method: 'POST', body });

    if (handleRsp) {
      dispatch(handleRsp(await rsp.json()));
    }
  };
}

export function powerOnLinode(id, configId = null) {
  return linodeAction(id, 'boot', JSON.stringify({ config_id: configId }), () =>
    actions.one({ status: 'booting' }, id));
}

export function powerOffLinode(id) {
  return linodeAction(id, 'shutdown', JSON.stringify({}), () =>
    actions.one({ status: 'shutting_down' }, id));
}

export function rebootLinode(id, configId = null) {
  return linodeAction(id, 'reboot', JSON.stringify({ config_id: configId }), () =>
    actions.one({ status: 'rebooting' }, id));
}

export function rescueLinode(id, disks = null) {
  return linodeAction(id, 'rescue', JSON.stringify({ disks }), () =>
    // Add this manually so StatusDropdown will start polling.
    actions.one({ status: 'rebooting' }, id));
}

export function rebuildLinode(id, config = null) {
  function makeNormalResponse(rsp, resource) {
    return {
      page: 1,
      totalPages: 1,
      totalResults: Object.values(rsp[resource]).length,
      [resource]: rsp[resource],
    };
  }

  function handleRsp(rsp) {
    return async (dispatch) => {
      // Add this manually so StatusDropdown will start polling.
      dispatch(actions.one({ status: 'rebuilding' }, id));
      await dispatch(actions.disks.invalidate([id], false));
      await dispatch(actions.disks.many(makeNormalResponse(rsp, 'disks'), id));
      await dispatch(actions.configs.invalidate([id], false));
      await dispatch(actions.configs.many(makeNormalResponse(rsp, 'configs'), id));
    };
  }

  return linodeAction(id, 'rebuild', JSON.stringify(config), handleRsp);
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

export function resizeLinode(linodeId, type) {
  return thunkFetch.post(`/linode/instances/${linodeId}/resize`, { type });
}

export function linodeBackups(linodeId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/linode/instances/${linodeId}/backups`);
    const json = { _backups: await response.json() };
    dispatch(actions.one(json, linodeId));
    return json._backups;
  };
}

export function linodeStats(linodeId) {
  return async (dispatch) => {
    const { data: _stats } = await dispatch(thunkFetch.get(`/linode/instances/${linodeId}/stats`));
    dispatch(actions.one({ _stats }, linodeId));
  };
}

export function cloneLinode(linodeId, regionId, planId, backups, label,
                            targetId = undefined, configs = [], disks = []) {
  return async function (dispatch) {
    const clonedLinode = await dispatch(thunkFetch.post(`/linode/instances/${linodeId}/clone`, {
      region: regionId,
      backups_enabled: backups,
      label: label,
      type: planId,
      disks: disks.length ? disks : undefined,
      configs: configs.length ? disks : undefined,
      linode: targetId,
    }));
    dispatch(actions.one(clonedLinode, clonedLinode.id));
    return clonedLinode;
  };
}

export function kvmifyLinode(linodeId) {
  return async function (dispatch) {
    const kvmifiedLinode = await dispatch(thunkFetch.post(`/linode/instances/${linodeId}/kvmify`));
    dispatch(actions.one(kvmifiedLinode, kvmifiedLinode.id));
    return kvmifiedLinode;
  };
}
