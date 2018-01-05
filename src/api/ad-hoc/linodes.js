import { actions } from '../generic/linodes';
import { actions as imageActions } from '../generic/images';
import { fetch } from '../fetch';


function linodeAction(id, action, body, handleRsp) {
  return async (dispatch) => {
    const rsp = await dispatch(fetch.post(`/linode/instances/${id}/${action}`, body));

    if (handleRsp) {
      dispatch(handleRsp(rsp));
    }
  };
}

export function powerOnLinode(id, configId = null) {
  return linodeAction(id, 'boot', { config_id: configId }, () =>
    actions.one({ status: 'booting' }, id));
}

export function powerOffLinode(id) {
  return linodeAction(id, 'shutdown', {}, () =>
    actions.one({ status: 'shutting_down' }, id));
}

export function rebootLinode(id, configId = null) {
  return linodeAction(id, 'reboot', { config_id: configId }, () =>
    actions.one({ status: 'rebooting' }, id));
}

export function rescueLinode(id, devices = null) {
  return linodeAction(id, 'rescue', { devices }, () =>
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

  return linodeAction(id, 'rebuild', config, handleRsp);
}

export function lishToken(linodeId) {
  return (dispatch) => dispatch(fetch.post(`/linode/instances/${linodeId}/lish_token`));
}

export function resetPassword(linodeId, diskId, password) {
  return (dispatch) =>
    dispatch(fetch.post(`/linode/instances/${linodeId}/disks/${diskId}/password`, { password }));
}

export function resizeLinodeDisk(linodeId, diskId, size) {
  return async (dispatch) => {
    dispatch(actions.disks.one({ id: diskId, size }, linodeId, diskId));
    await dispatch(fetch.post(`/linode/instances/${linodeId}/disks/${diskId}/resize`,
      { size }));
    // TODO: fetch until complete
  };
}

export function imagizeLinodeDisk(linodeId, diskId, data) {
  return async (dispatch) => {
    const imagizeUrl = `/linode/instances/${linodeId}/disks/${diskId}/imagize`;
    const image = await dispatch(fetch.post(imagizeUrl, data));
    dispatch(imageActions.one(image));
    return image;
  };
}

export function resizeLinode(linodeId, type) {
  return (dispatch) => dispatch(fetch.post(`/linode/instances/${linodeId}/resize`, { type }));
}

export function linodeBackups(linodeId) {
  return async (dispatch) => {
    const _backups = await dispatch(fetch.get(`/linode/instances/${linodeId}/backups`));
    dispatch(actions.one({ _backups }, linodeId));
    return _backups;
  };
}

export function linodeStats(linodeId, year, month) {
  return async (dispatch) => {
    const path = year && month ? `/linode/instances/${linodeId}/stats/${year}/${month}` :
      `/linode/instances/${linodeId}/stats`;
    const { data: _stats } = await dispatch(fetch.get(path));
    dispatch(actions.one({ _stats }, linodeId));
  };
}

export function cloneLinode(linodeId, regionId, planId, backups, label,
  targetId = undefined, configs = [], disks = []) {
  return async function (dispatch) {
    const clonedLinode = await dispatch(fetch.post(`/linode/instances/${linodeId}/clone`, {
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
    const kvmifiedLinode = await dispatch(fetch.post(`/linode/instances/${linodeId}/kvmify`));
    dispatch(actions.one(kvmifiedLinode, kvmifiedLinode.id));
    return kvmifiedLinode;
  };
}
