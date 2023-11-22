import {
  RegionalNetworkUtilization,
  getNetworkUtilization,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from './base';

export const useAccountTransfer = () =>
  useQuery<RegionalNetworkUtilization, APIError[]>(
    'network-utilization',
    getNetworkUtilization,
    queryPresets.oneTimeFetch
  );
