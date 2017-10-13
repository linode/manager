import { LONGVIEW_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import { gatherOptions } from '~/api/fetch';
import { actions } from '~/api/generic/lvclients';


function fetch(body, headers) {
  return async () => {
    const options = gatherOptions(null, 'POST', body);
    const path = LONGVIEW_ROOT;
    return new Promise((accept, reject) => {
      rawFetch(path, options).then(async (response) => {
        const { status } = response;
        const json = await response.json();
        console.log('json is', json);
        if (status >= 400) {
          reject(response);
        } else if (json && json.length && json[0].NOTIFICATIONS && json[0].NOTIFICATIONS.length) {
          console.log(json.NOTIFICATIONS);
          reject(response);
        } else {
          console.log('accepted', json);
          accept(json);
        }
      }, reject);
    });
  };
}

function get(id, params = {}) {
  return async (dispatch) => {
    const body = new URLSearchParams();
    body.set('api_key', id);
    Object.keys(params).forEach(k => body.set(k, params[k]));
    const stats = await dispatch(fetch(body));
    dispatch(actions.one({ _stats: stats }, id));
  };
}

/*
 * getValues
 * getLatestValue
 *  - keys: [
 *    `Applications.{application}.status`,
 *    `Applications.{application}.status_message`,
 *    "SysInfo.os.dist",
 *    "SysInfo.client",
 *  ]
 * getTopProcesses
 * lastUpdated
 * batch
 *  - api
 *	return 'DERIVE' if $dsName =~ m/^Processes\..*\.(cpu|ioreadkbytes|iowritekbytes)$/o;
 *	return 'DERIVE' if $dsName =~ m/^Disk\..*\.(reads|writes|read_bytes|write_bytes)$/o;
 *	return 'DERIVE' if $dsName =~ m/^CPU\..*\.(wait|system|user)$/o;
 *	return 'STATS'  if $dsName =~ m/^Network\.Linode\.v[46]\.(?:rx|tx|ip6_rx|ip6_tx)(?:_private)?_bytes/o;
 *	return 'DERIVE' if $dsName =~ m/^Network\.Interface\..*\.(tx_bytes|rx_bytes)$/o;
 *	return 'DERIVE' if $dsName =~ m/^Applications\.Apache\.Total/o;
 *	return 'DERIVE' if $dsName =~ m/^Applications\.Nginx\.(?:accepted_cons|handled_cons|requests)/o;
 *	return 'DERIVE' if $dsName =~ m/^Applications\.MySQL\.(?:Com|Slow_queries|Bytes|Connections|Max_used|Aborted|Qcache_hits|Qcache_inserts)/o;
 *	return "GAUGE"; # Default
 * 
 **/

export function getLatest(id, keys = [], start = null, end = null) {
  const params = {
    api_action: 'getLatest',
    keys: keys,
  };

  if (start && end) {
    params.start = start;
    params.end = end;
  }

  return get(id, params);
}

export function getTopProcesses(id, keys = [], start = null, end = null) {
  const params = {
    api_action: 'getTopProcesses',
    keys: keys,
  };

  if (start && end) {
    params.start = start;
    params.end = end;
  }

  return get(id, params);
}

// TODO: stub out more actions, refactor based on what is common
