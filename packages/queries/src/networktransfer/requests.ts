import { getNetworkTransferPrices } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { PriceType } from '@akamai/compute-ui-core/api';

export const getAllNetworkTransferPrices = () =>
  getAll<PriceType>((params) => getNetworkTransferPrices(params))().then(
    (data) => data.data,
  );
