import {
  getProfile,
  listGrants,
  Profile,
  smsOptOut,
  sendCodeToPhoneNumber,
  SendPhoneVerificationCodePayload,
  updateProfile,
  verifyPhoneNumberCode,
  VerifyVerificationCodePayload,
  Token,
  TokenRequest,
  createPersonalAccessToken,
  getSSHKeys,
  createSSHKey,
  SSHKey,
  deleteSSHKey,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { Grants } from '../../../api-v4/lib';
import { queryClient, queryPresets } from './base';
import { queryKey as accountUsersQueryKey } from './accountUsers';

export const queryKey = 'profile';

export const useProfile = (givenProfile?: Profile) =>
  useQuery<Profile, APIError[]>(queryKey, getProfile, {
    ...queryPresets.oneTimeFetch,
    initialData: givenProfile,
  });

export const useMutateProfile = () => {
  return useMutation<Profile, APIError[], Partial<Profile>>(
    (data) => updateProfile(data),
    { onSuccess: updateProfileData }
  );
};

export const useCreatePersonalAccessTokenMutation = () => {
  return useMutation<Token, APIError[], TokenRequest>(
    createPersonalAccessToken,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey, 'personal-access-tokens']);
      },
    }
  );
};

export const updateProfileData = (newData: Partial<Profile>): void => {
  queryClient.setQueryData(queryKey, (oldData: Profile) => ({
    ...oldData,
    ...newData,
  }));
};

export const useGrants = () =>
  useQuery<Grants, APIError[]>(
    `${queryKey}-grants`,
    listGrants,
    queryPresets.oneTimeFetch
  );

export const getProfileData = () => queryClient.getQueryData<Profile>(queryKey);
export const getGrantData = () =>
  queryClient.getQueryData<Grants>(`${queryKey}-grants`);

export const useSMSOptOutMutation = () =>
  useMutation<{}, APIError[]>(smsOptOut, {
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null });
    },
  });

export const useSendPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], SendPhoneVerificationCodePayload>(
    sendCodeToPhoneNumber
  );

export const useVerifyPhoneVerificationCodeMutation = () =>
  useMutation<{}, APIError[], VerifyVerificationCodePayload>(
    verifyPhoneNumberCode
  );

export const useSSHKeysQuery = (params?: any, filter?: any) =>
  useQuery(
    [queryKey, 'ssh-keys', params, filter],
    () => getSSHKeys(params, filter),
    {
      keepPreviousData: true,
    }
  );

export const useCreateSSHKeyMutation = () =>
  useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'ssh-keys']);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountUsersQueryKey]);
      },
    }
  );

export const useDeleteSSHKeyMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteSSHKey(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'ssh-keys']);
    },
  });
