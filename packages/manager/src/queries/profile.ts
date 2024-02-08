import {
  Profile,
  SSHKey,
  SendPhoneVerificationCodePayload,
  VerifyVerificationCodePayload,
  createSSHKey,
  deleteSSHKey,
  deleteTrustedDevice,
  disableTwoFactor,
  getProfile,
  getSSHKeys,
  getTrustedDevices,
  listGrants,
  sendCodeToPhoneNumber,
  smsOptOut,
  updateProfile,
  updateSSHKey,
  verifyPhoneNumberCode,
} from '@linode/api-v4/lib/profile';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { QueryClient, useMutation, useQueryClient } from 'react-query';

import { EventHandlerData } from 'src/hooks/useEventHandlers';
import { createQueryStore } from 'src/utilities/createQueryStore';

import { queryKey as accountQueryKey } from './account';
import { queryPresets } from './base';

import type { RequestOptions } from '@linode/api-v4';

export const queryKey = 'profile';

export const profileQueryStore = createQueryStore(queryKey, {
  children: {
    grants: {
      queryFn: listGrants,
    },
    profile: ({ headers }: RequestOptions = {}) => ({
      queryFn: () => getProfile({ headers }),
      queryKey: [headers],
    }),
    sshKeys: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getSSHKeys(params, filter),
      queryKey: [params, filter],
    }),
    trustedDevices: (params: Params = {}, filter: Filter = {}) => ({
      queryFn: () => getTrustedDevices(params, filter),
      queryKey: [params, filter],
    }),
  },
});

export const useProfile = (options?: RequestOptions) =>
  profileQueryStore.profile(options).useQuery({ ...queryPresets.oneTimeFetch });

export const useMutateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<Profile, APIError[], Partial<Profile>>(
    (data) => updateProfile(data),
    { onSuccess: (newData) => updateProfileData(newData, queryClient) }
  );
};

export const updateProfileData = (
  newData: Partial<Profile>,
  queryClient: QueryClient
): void => {
  profileQueryStore.profile().setQueryData(queryClient, (oldData: Profile) => ({
    ...newData,
    ...oldData,
  }));
};

export const useGrants = () => {
  const { data: profile } = useProfile();
  return profileQueryStore.grants.useQuery({
    ...queryPresets.oneTimeFetch,
    enabled: Boolean(profile?.restricted),
  });
};

export const getProfileData = (queryClient: QueryClient) =>
  profileQueryStore.profile().getQueryData(queryClient);

export const getGrantData = (queryClient: QueryClient) =>
  profileQueryStore.grants.getQueryData(queryClient);

export const useSMSOptOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(smsOptOut, {
    onSuccess: () => {
      updateProfileData({ verified_phone_number: null }, queryClient);
    },
  });
};

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
  profileQueryStore.sshKeys(params, filter).useQuery({
    enabled,
    keepPreviousData: true,
  });

export const useCreateSSHKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string; ssh_key: string }>(
    createSSHKey,
    {
      onSuccess() {
        profileQueryStore.sshKeys.invalidateQueries(queryClient);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );
};

export const useUpdateSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<SSHKey, APIError[], { label: string }>(
    (data) => updateSSHKey(id, data),
    {
      onSuccess() {
        profileQueryStore.sshKeys.invalidateQueries(queryClient);
        // also invalidate the /account/users data because that endpoint returns some SSH key data
        queryClient.invalidateQueries([accountQueryKey, 'users']);
      },
    }
  );
};

export const useDeleteSSHKeyMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteSSHKey(id), {
    onSuccess() {
      profileQueryStore.sshKeys.invalidateQueries(queryClient);
      // also invalidate the /account/users data because that endpoint returns some SSH key data
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};

export const sshKeyEventHandler = (event: EventHandlerData) => {
  // This event handler is a bit agressive and will over-fetch, but UX will
  // be great because this will ensure Cloud has up to date data all the time.

  profileQueryStore.sshKeys.invalidateQueries(event.queryClient);
  // also invalidate the /account/users data because that endpoint returns some SSH key data
  event.queryClient.invalidateQueries([accountQueryKey, 'users']);
};

export const useTrustedDevicesQuery = (params?: Params, filter?: Filter) =>
  profileQueryStore.trustedDevices(params, filter).useQuery({
    keepPreviousData: true,
  });

export const useRevokeTrustedDeviceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteTrustedDevice(id), {
    onSuccess() {
      profileQueryStore.trustedDevices.invalidateQueries(queryClient);
    },
  });
};

export const useDisableTwoFactorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(disableTwoFactor, {
    onSuccess() {
      profileQueryStore.profile().invalidateQueries(queryClient);
      // also invalidate the /account/users data because that endpoint returns 2FA status for each user
      queryClient.invalidateQueries([accountQueryKey, 'users']);
    },
  });
};
