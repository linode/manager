import { getQuotas } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, Params, Quota, QuotaServiceType } from '@linode/api-v4';

export const getAllQuotas = (
  service: QuotaServiceType,
  apiCollection: string,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Quota>((params, filter) =>
    getQuotas(
      service,
      apiCollection,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
