import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL } from 'src/request';

import type { Params, PriceType, ResourcePage } from 'src/types';

export const getNetworkTransferPrices = (params?: Params) =>
  Request<ResourcePage<PriceType>>(
    setURL(`${API_ROOT}/network-transfer/prices`),
    setMethod('GET'),
    setParams(params),
  );
