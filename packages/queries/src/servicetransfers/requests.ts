import { getServiceTransfers } from '@linode/api-v4';

import { listToItemsByID } from '../base';

import type { Filter, Params } from '@linode/api-v4/lib/';

export const getAllServiceTransfersRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getServiceTransfers(passedParams, passedFilter).then((data) => ({
    entityTransfers: listToItemsByID(data.data, 'token'),
    results: data.results,
  }));
