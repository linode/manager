import { BETA_API_ROOT } from '../constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

import type {
  Quota,
  QuotaCollection,
  QuotaServiceType,
  QuotaUsage,
} from './types';
import type { Filter, ResourcePage as Page, Params } from 'src/types';

/**
 * getQuota
 *
 * Returns the details for a single quota within a particular service specified by `type`.
 *
 * @param quotaService { QuotaServiceType } retrieve a quota within this service type.
 * @param id { number } the quota ID to look up.
 * @param quotaCollection { QuotaCollection } quota API collection name.
 */
export const getQuota = (
  quotaService: QuotaServiceType,
  quotaCollection: QuotaCollection,
  id: number,
) =>
  Request<Quota>(
    setURL(`${BETA_API_ROOT}/${quotaService}/${quotaCollection}/${id}`),
    setMethod('GET'),
  );

/**
 * getQuotas
 *
 * Returns a paginated list of quotas for a particular service specified by `quotaService`.
 *
 * This request can be filtered on `quota_name`, `service_name` and `scope`.
 *
 * @param quotaService { QuotaServiceType } retrieve quotas within this service quotaService.
 * @param quotaCollection { QuotaCollection } quota API collection name.
 * @param params { Params } query params to include in the request.
 * @param filter { Filter } filters to include in the request.
 */
export const getQuotas = (
  quotaService: QuotaServiceType,
  quotaCollection: QuotaCollection,
  params: Params = {},
  filter: Filter = {},
) =>
  Request<Page<Quota>>(
    setURL(`${BETA_API_ROOT}/${quotaService}/${quotaCollection}`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );

/**
 * getQuotaUsage
 *
 * Returns the usage for a single quota within a particular service specified by `type`.
 *
 * @param quotaService { QuotaServiceType } retrieve a quota within this service type.
 * @param quotaCollection { QuotaCollection } quota API collection name.
 * @param id { string } the quota ID to look up.
 */
export const getQuotaUsage = (
  quotaService: QuotaServiceType,
  quotaCollection: QuotaCollection,
  id: string,
) =>
  Request<QuotaUsage>(
    setURL(`${BETA_API_ROOT}/${quotaService}/${quotaCollection}/${id}/usage`),
    setMethod('GET'),
  );
