import { useQuery } from '@tanstack/react-query';

import { accountQueries } from './queries';

import type { APIError, RegionalNetworkUtilization } from '@linode/api-v4';

export const useAccountNetworkTransfer = () =>
  useQuery<RegionalNetworkUtilization, APIError[]>(accountQueries.transfer);
