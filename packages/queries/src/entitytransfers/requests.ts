import { getEntityTransfers } from '@linode/api-v4/lib/entity-transfers';

import { listToItemsByID } from '../base';

import type { Filter, Params } from '@linode/api-v4/lib/types';

export const getAllEntityTransfersRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getEntityTransfers(passedParams, passedFilter).then((data) => ({
    entityTransfers: listToItemsByID(data.data, 'token'),
    results: data.results,
  }));
