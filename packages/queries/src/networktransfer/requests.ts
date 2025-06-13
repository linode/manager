import { getNetworkTransferPrices } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

export const getAllNetworkTransferPrices = () =>
  getAll<PriceType>((params) => getNetworkTransferPrices(params))().then(
    (data) => data.data,
  );
