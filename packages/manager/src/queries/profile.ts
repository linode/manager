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
  getSSHKeys,
  createSSHKey,
  SSHKey,
  deleteSSHKey,
  updateSSHKey,
} from '@linode/api-v4/lib/profile';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useMutation, useQuery } from 'react-query';
import { Grants } from '../../../api-v4/lib';
import { queryClient, queryPresets } from './base';
import { queryKey as accountQueryKey } from './account';
import { Event } from '@linode/api-v4';

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

export const updateProfileData = (newData: Partial<Profile>): void => {
  queryClient.setQueryData(queryKey, (oldData: Profile) => ({
    ...oldData,
    ...newData,
  }));
};

export const useGrants = () => {
  const { data: profile } = useProfile();
  return useQuery<Grants, APIError[]>([queryKey, 'grants'], listGrants, {
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const getProfileData = () => queryClient.getQueryData<Profile>(queryKey);
export const getGrantData = () =>
  queryClient.getQueryData<Grants>([queryKey, 'grants']);

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

export const useSSHKeysQuery = (
  params?: Params,
  filter?: Filter,
  enabled = true
) =>
  useQuery(
    [queryKey, 'ssh-keys', 'paginated', params, filter],
    () => getSSHKeys(params, filter),
    {
      keepPreviousData: true,
      enabled,
    }
  );

export const useCreateSSHKeyMutation = () =>
  useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'ssh-keys']);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );

export const useUpdateSSHKeyMutation = (id: number) =>
  useMutation<SSHKey, APIError[], { label: string }>(
    (data) => updateSSHKey(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'ssh-keys']);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );

export const useDeleteSSHKeyMutation = (id: number) =>
  useMutation<{}, APIError[]>(() => deleteSSHKey(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'ssh-keys']);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });

export const sshKeyEventHandler = (event: Event) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  queryClient.invalidateQueries([queryKey, 'ssh-keys']);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  queryClient.invalidateQueries([accountQueryKey, 'users']);
};
