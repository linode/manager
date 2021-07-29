import {
  Account,
  getAccountInfo,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { mutationHandlers, queryPresets } from './base';

const queryKey = 'account';

export const useAccount = () =>
  useQuery<Account, APIError[]>(
    queryKey,
    getAccountInfo,
    queryPresets.oneTimeFetch
  );

export const useMutateAccount = () => {
  return useMutation<Account, APIError[], Partial<Account>>((data) => {
    return updateAccountInfo(data);
  }, mutationHandlers(queryKey));
};
