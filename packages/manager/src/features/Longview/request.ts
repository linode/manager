import Axios, { AxiosResponse } from 'axios';
import { curry, pathOr } from 'ramda';
import { LONGVIEW_ROOT } from 'src/constants';

import {
  LastUpdated,
  LongviewCPU,
  LongviewDisk,
  LongviewLoad,
  LongviewMemory,
  LongviewNetwork,
  LongviewPackages,
  LongviewSystemInfo
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

type AllData = LongviewCPU &
  LongviewDisk &
  LongviewLoad &
  LongviewMemory &
  LongviewNetwork &
  LongviewSystemInfo &
  LongviewPackages &
  LastUpdated;

/**
 * overload for the actual request
 *
 * this will need to be updated to account for different types of actions
 * and field names.
 *
 * For example if the action is getLatestValue and the field is ['CPU.*'],
 * the return type will be Promise<LongviewCPU>
 */
interface Get {
  (token: string, action: 'lastUpdated'): Promise<Partial<LastUpdated>>;
  (
    token: string,
    action: 'getLatestValue',
    field: ('load' | 'sysinfo')[]
  ): Promise<Partial<LongviewLoad & LongviewSystemInfo>>;
  (
    token: string,
    action: 'getLatestValue',
    field: ('cpu' | 'sysinfo')[]
  ): Promise<Partial<LongviewCPU & LongviewSystemInfo>>;
  (token: string, action: 'getLatestValue', field: ('disk')[]): Promise<
    Partial<LongviewDisk>
  >;
  (token: string, action: 'getLatestValue', field: 'memory'[]): Promise<
    Partial<LongviewMemory>
  >;
  (token: string, action: 'getLatestValue', field: 'network'[]): Promise<
    Partial<LongviewNetwork>
  >;
  (
    token: string,
    action: 'getLatestValue',
    field: ('cpu' | 'disk' | 'load' | 'memory' | 'network' | 'sysinfo')[]
  ): Promise<Partial<Omit<AllData, 'updated'>>>;
  (token: string, action: LongviewAction, field?: LongviewFieldName[]): Promise<
    Partial<AllData>
  >;
  (token: string, action: LongviewAction, field?: 'packages'[]): Promise<
    Partial<LongviewPackages>
  >;
}

export type LongviewAction =
  | 'batch'
  | 'getTopProcesses'
  | 'getLatestValue'
  | 'getValue'
  | 'getValues'
  | 'lastUpdated';

export interface LongviewResponse {
  VERSION: number;
  ACTION: LongviewAction;
  DATA: any;
  NOTIFICATIONS: LongviewError[];
}

export interface LongviewError {
  CODE: number;
  SEVERITY: number;
  TEXT: string;
}

/**
 * Scaffolding; expand as we gather requirements.
 */

export type LongviewFieldName =
  | 'cpu'
  | 'uptime'
  | 'memory'
  | 'load'
  | 'sysinfo'
  | 'network'
  | 'disk'
  | 'packages';

export const fieldNames: Record<LongviewFieldName, string> = {
  cpu: 'CPU.*',
  uptime: 'Uptime',
  memory: 'Memory.*',
  load: 'Load.*',
  network: 'Network.*',
  disk: 'Disk.*',
  sysinfo: 'SysInfo.*',
  packages: 'Packages'
};

export const baseRequest = Axios.create({
  baseURL: LONGVIEW_ROOT,
  method: 'POST',
  headers: { 'Content-Type': 'Multivalue-FormData' }
});

export const handleLongviewResponse = (
  response: AxiosResponse<[LongviewResponse]>
) => {
  const notifications = response.data[0].NOTIFICATIONS;
  if (notifications.length > 0) {
    /**
     * We have some errors.
     *
     * @todo check if there are non-error notifications
     * and what code/severity checking we should be doing
     * to make sure we only reject with errors.
     */
    const errors = notifications.map((thisNotification: LongviewError) => ({
      reason: pathOr('Error accessing Longview API', ['TEXT'], thisNotification)
    }));
    return Promise.reject(errors);
  } else {
    return Promise.resolve(response.data[0].DATA);
  }
};

export const get: Get = (
  token: string,
  action: LongviewAction,
  fields?: LongviewFieldName[]
) => {
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
  return request({
    data
  }).then(handleLongviewResponse);
};

export const getLastUpdated = (token: string) => {
  return get(token, 'lastUpdated');
};

export const getValues = curry((token: string, fields: LongviewFieldName[]) => {
  return get(token, 'getValues', fields);
});

export const getLatestValue = curry(
  (token: string, fields: LongviewFieldName[]) => {
    return get(token, 'getLatestValue', fields);
  }
);

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
