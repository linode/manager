import { getQuotas } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Filter,
  Params,
  Quota,
  QuotaCollection,
  QuotaServiceType,
} from '@linode/api-v4';

export const getAllQuotas = (
  service: QuotaServiceType,
  quotaCollection: QuotaCollection,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Quota>((params, filter) =>
    getQuotas(
      service,
      quotaCollection,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
