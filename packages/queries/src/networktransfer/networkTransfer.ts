import { queryPresets } from '@linode/queries';
import { useQuery } from '@tanstack/react-query';

import { getAllNetworkTransferPrices } from './requests';

import type { APIError, PriceType } from '@linode/api-v4';

export const queryKey = 'network-transfer';

export const useNetworkTransferPricesQuery = (enabled = true) =>
  useQuery<PriceType[], APIError[]>({
    queryFn: getAllNetworkTransferPrices,
    queryKey: [queryKey, 'prices'],
    ...queryPresets.oneTimeFetch,
    enabled,
  });
