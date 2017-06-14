import _ from 'lodash';
import { actions } from './configs/linodes';
import { thunkFetch } from './apiActionReducerGenerator';
import { createHeaderFilter } from './util';


export function ipv4s(region) {
  return async (dispatch, getState) => {
    const ips = await dispatch(thunkFetch.get(
      '/networking/ipv4',
      undefined,
      createHeaderFilter({ region: region.id }).headers));

    // We'll save all IPs at once at the end of organizing them.
    const _ipsByLinode = {};
    const { linodes } = getState().api.linodes;

    Object.values(ips.ipv4s).forEach(function (ip) {
      const id = ip.linode_id;

      // We need to retain all ipv6s.
      if (!_ipsByLinode[id]) {
        _ipsByLinode[id] = {};

        const currentLinode = linodes[id] || {};

        const currentIPv6s = Object.keys(currentLinode._ips || {}).filter(
          key => currentLinode._ips[key].version !== 'ipv4');

        currentIPv6s.forEach(function (key) {
          _ipsByLinode[id][key] = currentLinode._ips[key];
        });
      }

      _ipsByLinode[id] = {
        ..._ipsByLinode[id],
        [ip.address]: {
          ...ip,
          version: 'ipv4',
        },
      };
    });

    return Object.keys(_ipsByLinode).map(function (id) {
      const _ips = _ipsByLinode[id];
      return dispatch(actions.one({ _ips }, id));
    });
  };
}

export function assignIPs(region, assignments) {
  return async function(dispatch, getState) {
    const { linodes } = getState().api.linodes;
    const data = { region, assignments: [] };

    // Since we'll dispatch for each transfer we want to keep track of
    // the (current) state of the _ips, not their original state.
    const _ipsByLinode = {};
    function copyIPsInitially(id) {
      if (!_ipsByLinode[id]) {
        _ipsByLinode[id] = _.clone(linodes[id]._ips);
      }
    }

    assignments.forEach(function (assignment) {
      const { ip: { address, linode_id: currentLinodeId }, id } = assignment;

      // Format for API.
      data.assignments.push({ address, linode_id: id });

      // Grab (and modify copy of) current IPs.
      copyIPsInitially(currentLinodeId);
      copyIPsInitially(id);

      const currentLinodeIPs = _ipsByLinode[currentLinodeId];
      delete currentLinodeIPs[address];
      const otherLinodeIPs = _ipsByLinode[id];
      otherLinodeIPs[address] = {
        ...assignment.ip,
        linode_id: id,
      };
    });

    await dispatch(thunkFetch.post('/networking/ip-assign', data));

    // Only change state after post above succeeds.
    await Promise.all(Object.keys(_ipsByLinode).map(function (id) {
      const _ips = _ipsByLinode[id];

      // The ipv4 list on the linode needs to be updated for the Linode list
      // and dashboard pages.
      const ipv4 = Object.values(_ips).filter(
        ip => ip.version === 'ipv4').map(({ address }) => address);

      dispatch(actions.one({ _ips, ipv4 }, id));
    }));
  };
}

export function setRDNS(ip, rdns) {
  return async function (dispatch, getState) {
    const { linode_id: linodeId, address } = ip;
    const rawAddress = address.split('/')[0].trim();
    const { rdns: resultingRDNS } = await dispatch(
      thunkFetch.put(`/linode/instances/${linodeId}/ips/${rawAddress}`, { rdns }));

    const { _ips } = getState().api.linodes.linodes[linodeId];

    // This call above is likely to fail, so wait till now to update state.
    return dispatch(actions.one({
      _ips: {
        ..._ips,
        [address]: {
          ...ip,
          rdns: resultingRDNS,
        },
      },
    }, linodeId));
  };
}

export function addIP(linodeId, type) {
  return async (dispatch, getState) => {
    const { _ips } = getState().api.linodes.linodes[linodeId];

    const ip = await dispatch(
      thunkFetch.post(`/linode/instances/${linodeId}/ips`, { type }));

    return dispatch(actions.one({
      _ips: {
        ..._ips,
        [ip.address]: {
          ...ip,
          version: 'ipv4',
        },
      },
    }, linodeId));
  };
}

export function getIPs(linodeId) {
  return async function (dispatch) {
    const ips = await dispatch(thunkFetch.get(`/linode/instances/${linodeId}/ips`));

    const _ips = {};
    [...ips.ipv4.public, ...ips.ipv4.private].forEach(function (ip) {
      _ips[ip.address] = {
        ...ip,
        version: 'ipv4',
      };
    });

    _ips[ips.ipv6.link_local] = {
      address: ips.ipv6.link_local,
      type: 'link-local',
      version: 'ipv6',
      linode_id: linodeId,
    };

    _ips[ips.ipv6.slaac.address] = {
      ...ips.ipv6.slaac,
      type: 'slaac',
      version: 'ipv6',
      linode_id: linodeId,
    };

    ips.ipv6.global.forEach(function (ip) {
      _ips[ip.range] = {
        ...ip,
        type: 'pool',
        version: 'ipv6',
      };
    });

    ips.ipv6.addresses.forEach(function (ip) {
      _ips[ip.address] = {
        ...ip,
        version: 'ipv6',
        linode_id: linodeId,
      };
    });

    dispatch(actions.one({ _ips, _shared: ips.ipv4.shared }, linodeId));
  };
}

export function setShared(linodeId, ips) {
  return async function (dispatch) {
    const data = { ips: ips.map(({ address }) => address) };
    await dispatch(thunkFetch.post(`/linode/instances/${linodeId}/ips/sharing`, data));

    dispatch(actions.one({ _shared: ips }, linodeId));
  };
}
