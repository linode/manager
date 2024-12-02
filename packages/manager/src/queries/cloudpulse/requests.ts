import { getAlertDefinitions } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { Alert, Filter, Params } from '@linode/api-v4';

export const getAllAlertsRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Alert>((params, filter) =>
    getAlertDefinitions(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
