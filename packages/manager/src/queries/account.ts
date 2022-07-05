import { Account, getAccountInfo, updateAccountInfo } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
import { useMutation, useQuery } from 'react-query';
import { getGravatarUrl } from 'src/utilities/gravatar';
import { mutationHandlers, queryPresets } from './base';

export const queryKey = 'account';

export const useAccount = () =>
  useQuery<Account, APIError[]>(queryKey, getAccountInfo, {
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
  });

export const useMutateAccount = () => {
  return useMutation<Account, APIError[], Partial<Account>>((data) => {
    return updateAccountInfo(data);
  }, mutationHandlers(queryKey));
};

export const useAccountGravatar = (email: string) =>
  useQuery<string, string>(
    `${queryKey}-gravatar`,
    () => getGravatarUrl(email),
    {
      ...queryPresets.oneTimeFetch,
      enabled: Boolean(email),
    }
  );
