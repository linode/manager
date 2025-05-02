import Axios from 'axios';

import { LONGVIEW_ROOT } from 'src/constants';

import type {
  Get,
  LongviewAction,
  LongviewFieldName,
  LongviewNotification,
  LongviewResponse,
  Options,
} from './request.types';
import type { AxiosResponse } from 'axios';

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
  activeConnections: 'Ports.active',
  apache: 'Applications.Apache.*',
  apacheProcesses: 'Processes.apache.*',
  cpu: 'CPU.*',
  disk: 'Disk.*',
  listeningServices: 'Ports.listening',
  load: 'Load.*',
  memory: 'Memory.*',
  mysql: 'Applications.MySQL.*',
  mysqlProcesses: 'Processes.mysql.*',
  network: 'Network.*',
  nginx: 'Applications.Nginx.*',
  nginxProcesses: 'Processes.nginx.*',
  packages: 'Packages',
  processes: 'Processes.*',
  sysinfo: 'SysInfo.*',
  uptime: 'Uptime',
};

export const baseRequest = Axios.create({
  baseURL: LONGVIEW_ROOT,
  headers: { 'Content-Type': 'Multivalue-FormData' },
  method: 'POST',
});

export const handleLongviewResponse = (
  response: AxiosResponse<LongviewResponse<any>[]>
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

export const get: Get = async (
  token: string,
  action: LongviewAction,
  options: Partial<Options> = {}
) => {
  const { end, fields, start } = options;

  const request = baseRequest;
  const data = new FormData();
  data.set('api_key', token);
  data.set('api_action', action);
  if (fields) {
    data.set(
      'keys',
      JSON.stringify(fields.map((thisField) => fieldNames[thisField]))
    );
  }
  if (start) {
    data.set('start', `${start}`);
  }
  if (end) {
    data.set('end', `${end}`);
  }
  const response = await request({
    data,
  });
  return handleLongviewResponse(response);
};

export const getLastUpdated = (token: string) => {
  return get(token, 'lastUpdated');
};

export const getValues = (token: string, options: Options) => {
  return get(token, 'getValues', options);
};
