import { actions } from '../generic/linodes';
import request from '~/request';

function linodeAction(id, action, body, handleRsp) {
  return async (dispatch) => {
    const resp = await request.post(`/linode/instances/${id}/${action}`, body);

    if (handleRsp) {
      dispatch(handleRsp(resp));
    }
  };
}
// Verified
export function powerOnLinode(id, configId = null) {
  return linodeAction(id, 'boot', { config_id: configId }, () =>
    actions.one({ status: 'booting' }, id));
}

// Verified
export function powerOffLinode(id) {
  return linodeAction(id, 'shutdown', {}, () =>
    actions.one({ status: 'shutting_down' }, id));
}

// Verfied
export function rebootLinode(id, configId = null) {
  return linodeAction(id, 'reboot', { config_id: configId }, () =>
    actions.one({ status: 'rebooting' }, id));
}

// Verified
export function rescueLinode(id, devices = null) {
  return linodeAction(id, 'rescue', { devices }, () =>
    // Add this manually so StatusDropdown will start polling.
    actions.one({ status: 'rebooting' }, id));
}

// Verified
export function rebuildLinode(id, config = null) {
  function makeNormalResponse(rsp, resource) {
    return {
      page: 1,
      totalPages: 1,
      totalResults: Object.values(rsp[resource]).length,
      [resource]: rsp[resource],
    };
  }

  function handleRsp({ data }) {
    return async (dispatch) => {
      // Add this manually so StatusDropdown will start polling.
      dispatch(actions.one({ status: 'rebuilding' }, id));
      await dispatch(actions.disks.many(makeNormalResponse(data, 'disks'), id));
      await dispatch(actions.configs.many(makeNormalResponse(data, 'configs'), id));
    };
  }

  return linodeAction(id, 'rebuild', config, handleRsp);
}

// Verified
export function lishToken(linodeId) {
  request.post(`/linode/instances/${linodeId}/lish_token`);
  return (dispatch) => { dispatch({ type: '@@noop' }); };
}

// Verified
export function resetPassword(linodeId, diskId, password) {
  return () =>
    request.post(`/linode/instances/${linodeId}/disks/${diskId}/password`, { password });
}

// Verified
export function resizeLinodeDisk(linodeId, diskId, size) {
  return async (dispatch) => {
    dispatch(actions.disks.one({ id: diskId, size }, linodeId, diskId));
    await request.post(`/linode/instances/${linodeId}/disks/${diskId}/resize`,
      { size });
    // TODO: fetch until complete
  };
}

// Verified
export function resizeLinode(linodeId, type) {
  return () => request.post(`/linode/instances/${linodeId}/resize`, { type });
}

// Verified
export function linodeBackups(linodeId) {
  return async (dispatch) => {
    const { data: _backups } = await request.get(`/linode/instances/${linodeId}/backups`);
    dispatch(actions.one({ _backups }, linodeId));
    return _backups;
  };
}

// Verified
export function linodeStats(linodeId, year, month) {
  return async (dispatch) => {
    const path = year && month ? `/linode/instances/${linodeId}/stats/${year}/${month}` :
      `/linode/instances/${linodeId}/stats`;
    const { data: { state: _stats } } = await request.get(path);
    dispatch(actions.one({ _stats }, linodeId));
  };
}

// Verified
export function cloneLinode(
  linodeId,
  regionId,
  planId,
  backups,
  label,
  targetId = undefined,
  configs = [],
  disks = []
) {
  return async function (dispatch) {
    const { data: clonedLinode } = await request.post(`/linode/instances/${linodeId}/clone`, {
      region: regionId,
      backups_enabled: backups,
      label: label,
      type: planId,
      disks: disks.length ? disks : undefined,
      configs: configs.length ? disks : undefined,
      linode: targetId,
    });
    dispatch(actions.one(clonedLinode, clonedLinode.id));
    return clonedLinode;
  };
}

export function kvmifyLinode(linodeId) {
  return async function (dispatch) {
    const { data: kvmifiedLinode } = await request.post(`/linode/instances/${linodeId}/kvmify`);
    dispatch(actions.one(kvmifiedLinode, kvmifiedLinode.id));
    return kvmifiedLinode;
  };
}
