import { getNetworkUtilization, NetworkUtilization } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

export const useAccountTransfer = () =>
  useQuery<NetworkUtilization, APIError[]>(
    'network-utilization',
    getNetworkUtilization,
    queryPresets.oneTimeFetch
  );
