import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Filter, Params, ResourcePage } from '../types';
import { AccountMaintenance, MaintenancePolicy } from './types';

/**
 * getAccountMaintenance
 *
 * Returns a collection of Maintenance objects for any entity a user has permissions to view.
 *
 */
export const getAccountMaintenance = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<AccountMaintenance>>(
    setURL(`${API_ROOT}/account/maintenance`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getMaintenancePolicies
 *
 * Returns a list of maintenance policies that are available for Linodes in this account.
 *
 */
export const getMaintenancePolicies = () =>
  Request<MaintenancePolicy[]>(
    setURL(`${API_ROOT}/maintenance/policies`),
    setMethod('GET')
  );
