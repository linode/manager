import _ from 'lodash';

import { actions } from './configs/linodes';
import { thunkFetch } from './apiActionReducerGenerator';
import { createHeaderFilter } from './util';


// Internal helper function for updating IPs in redux state.
export function updateIP(ipv, ip) {
  return (dispatch, getState) => {
    const { type, address, linode_id: linodeId } = ip;
    const { _ips } = getState().api.linodes.linodes[linodeId];

    // Slaac is not a list like the rest.
    if (type === 'slaac') {
      dispatch(actions.one({ _ips: { ..._ips, ipv6: { ..._ips.ipv6, slaac: ip } } }));
    }

    // Only add IP to linode _ips if it isn't already there.
    if (!_.find(_ips[ipv][type], { address })) {
      dispatch(actions.one({
        _ips: {
          ..._ips,
          [ipv]: {
            ..._ips[ipv],
            [type]: [..._ips[ipv][type], ip],
          },
        },
      }, linodeId));
    }
  };
}

function fetchIPvs(ipv, region) {
  return async (dispatch, getState) => {
    const ips = await dispatch(thunkFetch.get(
      `/networking/${ipv}`,
      undefined,
      createHeaderFilter({ region: region.id }).headers));

    const linodes = getState().api.linodes.linodes;

    // Clear out existing state because update doesn't remove things.
    const startedUpdatingThisLinode = {};
    ips[`${ipv}s`].forEach(ip => {
      if (!linodes[ip.linode_id]) {
        return;
      }

      if (!startedUpdatingThisLinode[ip.linode_id]) {
        const _ips = linodes[ip.linode_id]._ips || {};
        dispatch(actions.one({
          _ips: {
            ..._ips,
            [ipv]: {
              ..._ips[ipv],
              public: [],
              private: [],
              global: [],
              addresses: [],
            },
          },
        }, ip.linode_id));
        startedUpdatingThisLinode[ip.linode_id] = true;
      }

      // Update the Linode with this IP.
      dispatch(updateIP(ipv, ip));
    });
  };
}

export function ipv4s(region) {
  return fetchIPvs('ipv4', region);
}

export function ipv6s(region) {
  return fetchIPvs('ipv6', region);
}

export function assignIPs(region, assignments) {
  return thunkFetch.post('/networking/ip-assign', { region, assignments });
}

export function setRDNS(ip, rdns) {
  return async (dispatch) => {
    const { linode_id: linodeId, address } = ip;
    await dispatch(thunkFetch.put(`/linode/instances/${linodeId}/ips/${address}`, { rdns }));

    // This call above is likely to fail, so wait till now to update state.
    const ipv = ['17', '24'].indexOf(ip.prefix) === -1 ? 'ipv6' : 'ipv4';
    dispatch(updateIP(ipv, ip.type, { ...ip, rdns }));
  };
}
