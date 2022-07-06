import {
  Account,
  getAccountInfo,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { useProfile } from 'src/queries/profile';
import { getGravatarUrl } from 'src/utilities/gravatar';
import { mutationHandlers, queryPresets } from './base';

export const queryKey = 'account';

export const useAccount = () => {
  const { data: profile } = useProfile();

  return useQuery<Account, APIError[]>(queryKey, getAccountInfo, {
    ...queryPresets.oneTimeFetch,
    ...queryPresets.noRetry,
    enabled: !profile?.restricted,
  });
};

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
