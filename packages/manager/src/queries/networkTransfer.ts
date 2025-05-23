import { getNetworkTransferPrices } from '@linode/api-v4';
import { queryPresets } from '@linode/queries';
import { getAll } from '@linode/utilities';
import { useQuery } from '@tanstack/react-query';

import type { APIError, PriceType } from '@linode/api-v4';

export const queryKey = 'network-transfer';

const getAllNetworkTransferPrices = () =>
  getAll<PriceType>((params) => getNetworkTransferPrices(params))().then(
    (data) => data.data
  );

export const useNetworkTransferPricesQuery = (enabled = true) =>
  useQuery<PriceType[], APIError[]>({
    queryFn: getAllNetworkTransferPrices,
    queryKey: [queryKey, 'prices'],
    ...queryPresets.oneTimeFetch,
    enabled,
  });
