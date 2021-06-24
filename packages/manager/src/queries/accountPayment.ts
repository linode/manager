import { getClientToken, ClientToken } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryPresets } from './base';

const queryKey = 'account-payment';

export const useClientToken = () =>
  useQuery<ClientToken, APIError[]>(
    queryKey,
    getClientToken,
    queryPresets.longLived
  );
