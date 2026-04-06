import { getQuotas } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, Params, Quota, QuotaType } from '@linode/api-v4';

export const getAllQuotas = (
  service: QuotaType,
  collection: string,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Quota>((params, filter) =>
    getQuotas(
      service,
      collection,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
