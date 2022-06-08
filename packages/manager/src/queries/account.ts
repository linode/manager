import {
  Account,
  getAccountInfo,
  smsOptOut,
  updateAccountInfo,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { getGravatarUrl } from 'src/utilities/gravatar';
import { mutationHandlers, queryPresets } from './base';
import { updateProfileData } from './profile';

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

export const useSMSOptOutMutation = () =>
  useMutation<{}, APIError[]>(smsOptOut, {
    onSuccess: () => {
      updateProfileData({ phone_number: null });
    },
  });
