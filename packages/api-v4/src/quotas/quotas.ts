import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type { Quota, QuotaType, QuotaUsage } from './types';
import type { Filter, ResourcePage as Page, Params } from 'src/types';

/**
 * getQuota
 *
 * Returns the details for a single quota within a particular service specified by `type`.
 *
 * @param type { QuotaType } retrieve a quota within this service type.
 * @param id { number } the quota ID to look up.
 * @param collection { string } quota collection name (quotas/global-quotas).
 */
export const getQuota = (type: QuotaType, collection: string, id: number) =>
  Request<Quota>(
    setURL(`${BETA_API_ROOT}/${type}/${collection}/${id}`),
    setMethod('GET'),
  );

/**
 * getQuotas
 *
 * Returns a paginated list of quotas for a particular service specified by `type`.
 *
 * This request can be filtered on `quota_name`, `service_name` and `scope`.
 *
 * @param type { QuotaType } retrieve quotas within this service type.
 * @param collection { string } quota collection name (quotas/global-quotas).
 */
export const getQuotas = (
  type: QuotaType,
  collection: string,
  params: Params = {},
  filter: Filter = {},
) =>
  Request<Page<Quota>>(
    setURL(`${BETA_API_ROOT}/${type}/${collection}`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );

/**
 * getQuotaUsage
 *
 * Returns the usage for a single quota within a particular service specified by `type`.
 *
 * @param type { QuotaType } retrieve a quota within this service type.
 * @param collection { string } quota collection name (quotas/global-quotas).
 * @param id { string } the quota ID to look up.
 */
export const getQuotaUsage = (
  type: QuotaType,
  collection: string,
  id: string,
) =>
  Request<QuotaUsage>(
    setURL(`${BETA_API_ROOT}/${type}/${collection}/${id}/usage`),
    setMethod('GET'),
  );
