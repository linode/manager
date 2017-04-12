import { fetch } from '~/fetch';
import { actions } from './configs/linodes';
import { thunkFetch } from './apiActionReducerGenerator';


function linodeAction(id, action, body, handleRsp) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const rsp = await fetch(token, `/linode/instances/${id}/${action}`, { method: 'POST', body });

    dispatch(actions.one({ ...body }, id));
    if (handleRsp) {
      dispatch(handleRsp(await rsp.json()));
    }
  };
}

export function powerOnLinode(id, config = null) {
  return linodeAction(id, 'boot', JSON.stringify({ config }));
}

export function powerOffLinode(id, config = null) {
  return linodeAction(id, 'shutdown', JSON.stringify({ config }));
}

export function rebootLinode(id, config = null) {
  return linodeAction(id, 'reboot', JSON.stringify({ config }));
}

export function rescueLinode(id, disks = null) {
  return linodeAction(id, 'rescue', JSON.stringify({ disks }));
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

export function setRDNS(linodeId, address, rdns) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linode/instances/${linodeId}/ips/${address}`, {
      method: 'PUT',
      body: JSON.stringify({ rdns }),
    });

    // This endpoint is likely to fail, so don't update state till it succeeded
    const ips = { ...state.api.linodes.linodes[linodeId]._ips };

    // It is difficult to know which IP address was updated because the addresses
    // aren't currently mapped by key and exist in groups (and sub-groups).
    // This function goes through groups of an ip version and only sets the single
    // IP RDNS entry that was updated in the setRDNS call. This is complicated slightly by
    // trying to work on read-only objects that tests obsess over.
    function updateRDNS(ipType, ipGroups) {
      for (const ipGroup of ipGroups) {
        for (let i = 0; i < ips[ipType][ipGroup].length; i++) {
          const ip = ips[ipType][ipGroup][i];
          if (ip.address === address) {
            // This gets around assigning to read-only arrays
            const newIpType = {
              ...ips[ipType],
              [ipGroup]: [...ips[ipType][ipGroup]],
            };
            newIpType[ipGroups][i] = { ...ip, rdns };
            ips[ipType] = newIpType;
          }
        }
      }
    }

    updateRDNS('ipv4', ['public']);
    // TODO: add 'global' and 'slaac' once the API supports them
    updateRDNS('ipv6', ['addresses']);
    // Save changes to local state
    dispatch(actions.one({ _ips: ips }, linodeId));

    // Fetch from the API async to double check
    dispatch(linodeIPs(linodeId));
  };
}

export function resizeLinode(linodeId, type) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linode/instances/${linodeId}/resize`,
      { method: 'POST', body: JSON.stringify({ type }) });
    dispatch(linodeIPs(linodeId));
  };
}

export function linodeBackups(linodeId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/linode/instances/${linodeId}/backups`);
    const json = { _backups: await response.json() };
    dispatch(actions.one(json, linodeId));
  };
}

export function setShared(linodeId, ips) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/linode/instances/${linodeId}/ips/sharing`, {
      method: 'POST',
      body: JSON.stringify({ ips }),
    });
  };
}

export function assignIps(region, assignments) {
  return thunkFetch.post('/networking/ip-assign', { region, assignments });
}

export function linodeStats(linodeId) {
  return async (dispatch) => {
    const { data: _stats } = await dispatch(thunkFetch.get(`/linode/instances/${linodeId}/stats`));
    dispatch(actions.one({ _stats }, linodeId));
  };
}
