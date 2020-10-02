// @todo use beta api root once API bug is fixed
import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage as Page } from '../types';

import { CreateVLANPayload, VLAN } from './types';

/**
 * getVlans
 *
 * Return a paginated list of Virtual LANS (VLANS) on this account.
 *
 */
export const getVlans = (params?: any, filters?: any) =>
  Request<Page<VLAN>>(
    setURL(`${API_ROOT}/networking/vlans`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * getVlan
 *
 * Return detailed information about a single VLAN
 *
 */
export const getVlan = (vlanID: number) =>
  Request<Page<VLAN>>(
    setURL(`${API_ROOT}/networking/vlans/${vlanID}`),
    setMethod('GET')
  );

/**
 * createVlan
 *
 * Create a Virtual LAN (VLAN) in the specified region.
 *
 */
export const createVlan = (data: CreateVLANPayload) =>
  Request<VLAN>(
    setURL(`${API_ROOT}/networking/vlans`),
    setMethod('POST'),
    setData(data)
  );

/**
 * deleteVlan
 *
 * Delete a single VLAN
 */
export const deleteVlan = (vlanID: number) =>
  Request<VLAN>(
    setURL(`${API_ROOT}/networking/vlans/${vlanID}`),
    setMethod('DELETE')
  );

/**
 * connectVlan
 *
 * Connect one or more Linodes from a VLAN. The VLAN
 * will be attached to an interface on every config
 * on each target Linode.
 */
export const connectVlan = (vlanID: number, linodes: number[]) =>
  Request<VLAN>(
    setURL(`${API_ROOT}/networking/vlans/${vlanID}/connect`),
    setMethod('POST'),
    setData({ linodes })
  );

/**
 * disconnectVlan
 *
 * Disconnect one or more Linodes from a VLAN. The VLAN
 * will be detached from every config
 * on each target Linode.
 */
export const disconnectVlan = (vlanID: number, linodes: number[]) =>
  Request<VLAN>(
    setURL(`${API_ROOT}/networking/vlans/${vlanID}/disconnect`),
    setMethod('POST'),
    setData({ linodes })
  );
