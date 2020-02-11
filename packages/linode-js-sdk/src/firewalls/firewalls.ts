import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import { CreateFirewallSchema, FirewallDeviceSchema } from './firewalls.schema';
import {
  CreateFirewallPayload,
  Firewall,
  FirewallDevice,
  FirewallDevicePayload,
  FirewallRules
} from './types';

/**
 * GET firewalls
 */
export const getFirewalls = (params?: any, filters?: any) =>
  Request<Page<Firewall>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls`)
  ).then(response => response.data);

export const getFirewallRules = (
  firewallID: number,
  params?: any,
  filters?: any
) =>
  Request<Page<FirewallRules>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/rules`)
  ).then(response => response.data);

export const getFirewallDevices = (
  firewallID: number,
  params?: any,
  filters?: any
) =>
  Request<Page<FirewallDevice>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices`)
  ).then(response => response.data);

export const createFirewall = (data: CreateFirewallPayload) =>
  Request<Firewall>(
    setMethod('POST'),
    setData(data, CreateFirewallSchema),
    setURL(`${BETA_API_ROOT}/networking/firewalls`)
  ).then(response => response.data);

export const addFirewallDevice = (
  firewallID: number,
  data: FirewallDevicePayload
) =>
  Request<FirewallDevice>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices`),
    setData(data, FirewallDeviceSchema)
  ).then(response => response.data);

export const deleteFirewallDevice = (firewallID: number, deviceID: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${BETA_API_ROOT}/networking/firewalls/${firewallID}/devices/${deviceID}`
    )
  ).then(response => response.data);
