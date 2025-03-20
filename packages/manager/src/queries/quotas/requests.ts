import { getQuotas } from '@linode/api-v4';

import { getAll } from '@linode/utilities';

import type { Filter, Params, Quota, QuotaType } from '@linode/api-v4';

export const getAllQuotas = (
  service: QuotaType,
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Quota>((params, filter) =>
    getQuotas(
      service,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
