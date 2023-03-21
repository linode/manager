import {
  getNetworkUtilization,
  NetworkUtilization,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';
import { queryKey } from './account';
import { queryPresets } from './base';

export const useAccountTransfer = () =>
  useQuery<NetworkUtilization, APIError[]>(
    [queryKey, 'transfer'],
    getNetworkUtilization,
    queryPresets.oneTimeFetch
  );
