import { getNetworkTransferPrices } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { PriceType } from '@linode/api-v4';

export const getAllNetworkTransferPrices = () =>
  getAll<PriceType>((params) => getNetworkTransferPrices(params))().then(
    (data) => data.data,
  );
