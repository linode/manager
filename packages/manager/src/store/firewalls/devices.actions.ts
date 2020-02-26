import {
  FirewallDevice,
  FirewallDevicePayload
} from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';

import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/firewalls`);

export interface GetDevicesPayload {
  firewallID: number;
  params?: any;
  filters?: any;
}
export const getAllFirewallDevicesActions = actionCreator.async<
  GetDevicesPayload,
  FirewallDevice[],
  APIError[]
>(`get-all`);

export type AddDevicePayload = FirewallDevicePayload & { firewallID: number };
export const addFirewallDeviceActions = actionCreator.async<
  AddDevicePayload,
  FirewallDevice,
  APIError[]
>(`add`);

export const removeFirewallDeviceActions = actionCreator.async<
  { firewallID: number; deviceID: number },
  {},
  APIError[]
>(`delete`);
