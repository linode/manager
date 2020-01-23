import Axios, { AxiosResponse } from 'axios';
import { curry } from 'ramda';
import { LONGVIEW_ROOT } from 'src/constants';
import {
  Get,
  LongviewAction,
  LongviewFieldName,
  LongviewNotification,
  LongviewResponse,
  Options
} from './request.types';

/**
 * A successful LV request results in a response like this:
 *
 * [
 *   {
 *       "NOTIFICATIONS": [],
 *       "ACTION": "lastUpdated",
 *       "DATA": {
 *           "updated": 1568823297
 *       },
 *       "VERSION": 0.4
 *   }
 * ]
 *
 * It's always an array! This is (probably) to support
 * batch operations, where each response is a separate
 * entry in the array.
 *
 * This means that for a single request, the data we want
 * will be in response.data[0].DATA.
 *
 * Errors will have a status code of 200, with the errors in
 * the NOTIFICATIONS field:
 *
 * [
 *   {
 *       "VERSION": 0.4,
 *       "ACTION": "lastUpdated",
 *       "NOTIFICATIONS": [
 *           {
 *               "CODE": 4,
 *               "SEVERITY": 3,
 *               "TEXT": "Authentication failed."
 *           }
 *       ],
 *       "DATA": {}
 *   }
 * ]
 *
 * So the errors will be available at response.data[0].NOTIFICATIONS.
 */

/**
 * overload for the actual request
 *
 * this will need to be updated to account for different types of actions
 * and field names.
 *
 * For example if the action is getLatestValue and the field is ['CPU.*'],
 * the return type will be Promise<LongviewCPU>
 */

export const fieldNames: Record<LongviewFieldName, string> = {
  cpu: 'CPU.*',
  uptime: 'Uptime',
  memory: 'Memory.*',
  load: 'Load.*',
  network: 'Network.*',
  disk: 'Disk.*',
  sysinfo: 'SysInfo.*',
  packages: 'Packages',
  processes: 'Processes.*',
  listeningServices: 'Ports.listening',
  activeConnections: 'Ports.active',
  nginx: 'Applications.Nginx.*',
  nginxProcesses: 'Processes.nginx.*',
  apache: 'Applications.Apache.*',
  apacheProcesses: 'Processes.apache.*',
  mysql: 'Applications.MySQL.*',
  mysqlProcesses: 'Processes.mysql.*'
};

export const baseRequest = Axios.create({
  baseURL: LONGVIEW_ROOT,
  method: 'POST',
  headers: { 'Content-Type': 'Multivalue-FormData' }
});

export const handleLongviewResponse = (
  response: AxiosResponse<LongviewResponse<any>>
) => {
  const notifications = response.data[0].NOTIFICATIONS;
  /**
   * A SEVERITY code of 3 indicates
   * a fatal error; we should reject the promise.
   */
  const errors = notifications.filter(
    (thisNotification: LongviewNotification) => thisNotification.SEVERITY === 3
  );
  if (errors.length > 0) {
    return Promise.reject(errors);
  } else {
    return Promise.resolve(response.data[0]);
  }
};

export const get: Get = (
  token: string,
  action: LongviewAction,
  options: Partial<Options> = {}
) => {
  const { fields, start, end } = options;

  const request = baseRequest;
  const data = new FormData();
  data.set('api_key', token);
  data.set('api_action', action);
  if (fields) {
    data.set(
      'keys',
      JSON.stringify(fields.map(thisField => fieldNames[thisField]))
    );
  }
  if (start) {
    data.set('start', `${start}`);
  }
  if (end) {
    data.set('end', `${end}`);
  }
  return request({
    data
  }).then(handleLongviewResponse);
};

export const getLastUpdated = (token: string) => {
  return get(token, 'lastUpdated');
};

export const getValues = curry((token: string, options: Options) => {
  return get(token, 'getValues', options);
});

export const getLatestValue = curry((token: string, options: Options) => {
  return get(token, 'getLatestValue', options);
});

export const getTopProcesses = curry((token: string, options?: Options) => {
  return get(token, 'getTopProcesses', options);
});

export default get;

/*
 * getTopProcesses
 * lastUpdated
 * batch
 *  - api
 * getValues and getLatestValue
 *  - keys:
 *    - SysInfo.(os.distSysInfo|client)
 *    - Processes.*.(cpu|ioreadkbytes|iowritekbytes)
 *    - Disk.*.(reads|writes|read_bytes|write_bytes)
 *    - CPU.*.(wait|system|user)
 *    - Network.Linode.v[46].(rx|tx|ip6_rx|ip6_tx)(_private)_bytes
 *    - Network.Interface.*.(tx_bytes|rx_bytes)
 *    - Applications.{application}.status
 *    - Applications.{application}.status_message
 *    - Applications.Apache.Total
 *    - Applications.Nginx.(accepted_cons|handled_cons|requests)
 *    - Applications.MySQL.(Com|Slow_queries|Bytes|Connections|Max_used|Aborted|
 *    -                     Qcache_hits|Qcache_inserts)
 *    - Packages (?)
 **/
