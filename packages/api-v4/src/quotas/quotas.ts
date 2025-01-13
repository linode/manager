import { Filter, Params, ResourcePage as Page } from 'src/types';
import { API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { Quota, QuotaType } from './types';

/**
 * getQuota
 *
 * Returns the details for a single quota within a particular service specified by `type`.
 *
 * @param type { QuotaType } retrieve a quota within this service type.
 * @param id { number } the quota ID to look up.
 */
export const getQuota = (type: QuotaType, id: number) =>
  Request<Quota>(setURL(`${API_ROOT}/${type}/quotas/${id}`), setMethod('GET'));

/**
 * getQuotas
 *
 * Returns a paginated list of quotas for a particular service specified by `type`.
 *
 * This request can be filtered on `quota_name`, `service_name` and `scope`.
 *
 * @param type { QuotaType } retrieve quotas within this service type.
 */
export const getQuotas = (
  type: QuotaType,
  params: Params = {},
  filter: Filter = {}
) =>
  Request<Page<Quota>>(
    setURL(`${API_ROOT}/${type}/quotas`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params)
  );
