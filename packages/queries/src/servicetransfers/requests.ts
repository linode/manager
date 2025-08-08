// import { getServiceTransfers } from '@linode/api-v4/lib/';

import {
  type Filter,
  getServiceTransfers,
  type Params,
} from '@linode/api-v4/lib/types';

import { listToItemsByID } from '../base';

export const getAllServiceTransfersRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getServiceTransfers(passedParams, passedFilter).then((data) => ({
    entityTransfers: listToItemsByID(data.data, 'token'),
    results: data.results,
  }));
