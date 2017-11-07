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
        if (status >= 400) {
          reject(response);
        } else {
          accept(json);
        }
      }, reject);
    });
  };
}

function get(id, params = {}) {
  return async (dispatch) => {
    const body = new URLSearchParams();
    // body.set('api_key', id);
    Object.keys(params).forEach(k => body.set(k, params[k]));
    const stats = await dispatch(fetch(body));
    console.log(`longview ${id} stats incoming`, stats);
    stats.forEach(stat => {
      if (stat.NOTIFICATIONS.length) {
        // structured as: {CODE, SEVERITY, TEXT}
        console.warn('notifications', stat.NOTIFICATIONS);
      }
      // @todo further filter by date range

      console.log('actions.one', { [`_${stat.ACTION}`]: stat.DATA });
      dispatch(actions.one({ [`_${stat.ACTION}`]: stat.DATA }, id));
    });
  };
}

const lvStatsFetch = (action) => (id, apiKey, keys = [], start = null, end = null) => {
  const params = {
    api_key: apiKey,
    api_action: action,
    keys: JSON.stringify(keys),
  };

  // start implies seconds relative to now
  // unless end is also provided
  if (end && start) {
    params.start = start;
    params.end = end;
  } else if (start) {
    const now = parseInt(Date.now() / 1000);
    params.end = now;
    params.start = now - start * 100;
  }

  return get(id, params);
};

export const getValues = lvStatsFetch('getValues');
export const getTopProcesses = lvStatsFetch('getTopProcesses');
export const getLatest = lvStatsFetch('getLatest');

// TODO: stub out more actions, refactor based on what is common

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
 * Processes.*.(cpu|ioreadkbytes|iowritekbytes)
 * Disk.*.(reads|writes|read_bytes|write_bytes)
 * CPU.*.(wait|system|user)
 * Network.Linode.v[46].(rx|tx|ip6_rx|ip6_tx)(_private)_bytes
 * Network.Interface.*.(tx_bytes|rx_bytes)
 * Applications.Apache.Total
 * Applications.Nginx.(accepted_cons|handled_cons|requests)
 * Applications.MySQL.(Com|Slow_queries|Bytes|Connections|Max_used|Aborted|Qcache_hits|Qcache_inserts)
 * Applications.{application}.status
 * Applications.{application}.status_message
 * 
 **/
