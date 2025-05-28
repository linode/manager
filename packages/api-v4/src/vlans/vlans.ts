import { BETA_API_ROOT as API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { VLAN } from './types';

/**
 * getVlans
 *
 * Return a paginated list of Virtual LANS (VLANS) on this account.
 *
 */
export const getVlans = (params?: Params, filters?: Filter) =>
  Request<Page<VLAN>>(
    setURL(`${API_ROOT}/networking/vlans`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * getVlan
 *
 * Return detailed information about a single VLAN
 *
 */
export const getVlan = (vlanID: number) =>
  Request<Page<VLAN>>(
    setURL(`${API_ROOT}/networking/vlans/${encodeURIComponent(vlanID)}`),
    setMethod('GET'),
  );
